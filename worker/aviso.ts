/**
 * Aviso por e-mail quando entra um pedido de reserva.
 *
 * O formulário grava o pedido e manda o cliente para o WhatsApp com a mensagem
 * pronta — mas quem aperta enviar é ele. Quando não aperta, o pedido fica só no
 * painel e ninguém fica sabendo, enquanto o FAQ promete "respondemos em
 * minutos". Este módulo fecha esse buraco.
 *
 * Usa o envio da própria Cloudflare, que é gratuito e não consome cota quando o
 * destino é um endereço verificado da conta — a documentação descreve
 * exatamente este caso, "alertas para a sua própria caixa". Nenhum serviço de
 * terceiro entra no caminho, e nenhum dado de criança sai para fora.
 *
 * Nada aqui pode derrubar a gravação do pedido: quem chama usa `waitUntil` e
 * engole a exceção. O pior caso é aviso atrasado, nunca pedido perdido.
 */

const PAINEL = "https://afantasiaencantada.com/admin/";
/**
 * Com nome de exibição: na caixa aparece "Fantasia Encantada" em vez do
 * endereço cru. Não é o que decide spam — isso é DNS e reputação —, mas custa
 * uma linha e a mensagem parece menos automática.
 */
const REMETENTE = { name: "Fantasia Encantada", email: "avisos@afantasiaencantada.com" };

/** Campos do pedido, na ordem em que fazem sentido para quem vai retornar. */
const CAMPOS: [chave: string, rotulo: string][] = [
  ["personagem_nome", "Personagem"],
  ["mundo_nome", "Mundo"],
  ["data_festa", "Data"],
  ["periodo", "Período"],
  ["horario", "Horário"],
  ["endereco", "Endereço"],
  ["tipo_local", "Tipo de local"],
  ["crianca_nome", "Criança"],
  ["crianca_idade", "Idade"],
  ["observacao", "Observação"],
  ["utm_source", "Veio de"],
  ["utm_campaign", "Campanha"],
];

/**
 * O conteúdo vem de formulário público e vai para dentro de um HTML que a dona
 * abre no celular. Sem escapar, um nome com `<script>` ou `<img onerror>` viaja
 * junto — o cliente de e-mail costuma barrar, mas confiar nisso é apostar.
 */
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 2026-11-21 → 21/11/2026. Data inválida volta como veio, sem inventar. */
function dataBR(v: unknown): string {
  const s = String(v ?? "");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
}

/** (11) 93223-7456 a partir de 11 dígitos. */
function telefoneBonito(v: unknown): string {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : String(v ?? "");
}

/** Link que já abre a conversa com o responsável, sem digitar número. */
function linkWhats(v: unknown): string | null {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length === 11 ? `https://wa.me/55${d}` : null;
}

export interface DadosAviso {
  [chave: string]: unknown;
}

/**
 * Aceita vários endereços separados por vírgula. É o que permite começar
 * enviando para quem consegue verificar hoje e acrescentar a caixa da empresa
 * depois, com um `wrangler secret put` — sem tocar em código nem publicar.
 */
function destinatarios(env: Env): string[] {
  return (env.AVISO_EMAIL_PARA ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

/**
 * Monta e envia. `novo` diferencia primeiro envio de correção: a tela de
 * confirmação oferece "revisar os dados", e sem essa distinção uma correção
 * chegaria como se fosse um segundo pedido.
 */
export async function avisarPedido(env: Env, dados: DadosAviso, novo: boolean): Promise<void> {
  const para = destinatarios(env);

  // Sem destino configurado não há o que fazer, e não é erro: o site funciona
  // sem aviso. Ver docs/painel-admin.md para ligar.
  if (para.length === 0) return;

  const quem = String(dados.responsavel_nome ?? "").trim() || "sem nome";
  const personagem = String(dados.personagem_nome ?? "").trim() || "sem personagem";
  const quando = dataBR(dados.data_festa);
  const tel = telefoneBonito(dados.responsavel_telefone);
  const whats = linkWhats(dados.responsavel_telefone);

  // Assunto pensado para ser lido na tela de bloqueio, sem abrir nada.
  const assunto = `${novo ? "Pedido novo" : "Pedido corrigido"}: ${personagem}${
    quando ? ` · ${quando}` : ""
  } · ${quem}`;

  const linhas = CAMPOS.map(([chave, rotulo]) => {
    const bruto = dados[chave];
    if (bruto === null || bruto === undefined || String(bruto).trim() === "") return null;
    const valor = chave === "data_festa" ? dataBR(bruto) : String(bruto);
    return [rotulo, valor] as const;
  }).filter((l): l is readonly [string, string] => l !== null);

  const texto = [
    novo ? "Pedido novo pelo site." : "Pedido corrigido pelo cliente (mesmo pedido de antes).",
    "",
    `Responsável: ${quem}`,
    `Telefone: ${tel}`,
    whats ? `WhatsApp: ${whats}` : null,
    "",
    ...linhas.map(([r, v]) => `${r}: ${v}`),
    "",
    `Painel: ${PAINEL}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#251629">
  <p style="margin:0 0 4px"><strong>${novo ? "Pedido novo pelo site." : "Pedido corrigido pelo cliente."}</strong></p>
  <p style="margin:0 0 16px;font-size:20px"><strong>${esc(personagem)}</strong>${quando ? ` · ${esc(quando)}` : ""}</p>
  <p style="margin:0 0 16px">
    ${esc(quem)} · ${esc(tel)}<br>
    ${whats ? `<a href="${esc(whats)}" style="color:#a44e68">Responder no WhatsApp</a>` : ""}
  </p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${linhas
      .map(
        ([r, v]) =>
          `<tr><td style="padding:3px 14px 3px 0;color:#6b5a66;vertical-align:top">${esc(r)}</td><td style="padding:3px 0"><strong>${esc(v)}</strong></td></tr>`,
      )
      .join("")}
  </table>
  <p style="margin:18px 0 0"><a href="${PAINEL}" style="color:#a44e68">Abrir o painel</a></p>
</div>`;

  await env.EMAIL.send({ to: para, from: REMETENTE, subject: assunto, text: texto, html });
}

/* ——— resumo da manhã ——— */

/** Dias inteiros desde que o pedido chegou. */
function diasEsperando(criadoEm: unknown): number {
  const t = new Date(String(criadoEm ?? "")).getTime();
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86400000) : 0;
}

/** "há 3 dias" / "hoje". O que decide o que responder primeiro. */
function esperaEmTexto(dias: number): string {
  if (dias <= 0) return "hoje";
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

/** O horário é texto livre no formulário ("15h", "15:00"). Sem ele, o período. */
function quandoDaFesta(l: Record<string, unknown>): string {
  const h = String(l.horario ?? "").trim();
  if (h) return h;
  const p = String(l.periodo ?? "").trim();
  return p ? p.toLowerCase() : "sem horário";
}

/**
 * O e-mail das 7 da manhã: o que acontece hoje e o que está esperando resposta.
 *
 * Existe por um motivo concreto. Um pedido real ficou mais de um dia sem
 * resposta porque o painel só conta o que tem para quem decide abrir o painel —
 * e o FAQ promete "respondemos em minutos". Aviso de pedido novo resolve o
 * instante da chegada; este resolve o que ficou para trás.
 *
 * **Só sai quando há o que dizer.** Um "bom dia, hoje nada" diário ensina a
 * ignorar o remetente, e aí o dia que importa passa batido junto. Silêncio aqui
 * significa: nenhuma festa hoje e nenhum pedido esperando. O canal continua
 * sendo exercitado pelos avisos de pedido novo, então caixa muda não vira
 * dúvida sobre o sistema estar de pé.
 */
export interface LinhasResumo {
  festas: Record<string, unknown>[];
  abertos: Record<string, unknown>[];
  proxima?: Record<string, unknown>;
}

/**
 * Monta o e-mail a partir das linhas. Separado do banco de propósito, pela mesma
 * razão que as contas da agenda vivem fora do React: assim dá para conferir o
 * texto contra linhas de verdade, sem esperar as 7 da manhã para descobrir que
 * uma coluna veio nula.
 *
 * Devolve `null` quando não há o que dizer — ver `resumoDoDia`.
 */
export function montarResumo(
  linhas: LinhasResumo,
): { assunto: string; texto: string; html: string } | null {
  const { festas: doDia, abertos, proxima: prox } = linhas;
  if (doDia.length === 0 && abertos.length === 0) return null;

  const maisAntigo = abertos.length ? diasEsperando(abertos[0].criado_em) : 0;

  // Assunto pensado para a tela de bloqueio: ela precisa decidir se abre agora
  // sem abrir. Por isso o número vem antes da palavra.
  const pedacos: string[] = [];
  if (doDia.length === 1) {
    // O nome da criança é o que localiza a festa de relance. Sem ele, "festa de
    // criança" soa como erro do sistema — melhor dizer menos e dizer certo.
    const nome = String(doDia[0].crianca_nome ?? "").trim();
    pedacos.push(`Hoje: ${nome ? `festa de ${nome}` : "1 festa"}, ${quandoDaFesta(doDia[0])}`);
  } else if (doDia.length > 1) {
    pedacos.push(`Hoje: ${doDia.length} festas`);
  }
  if (abertos.length) {
    pedacos.push(
      `${abertos.length} esperando resposta${maisAntigo >= 2 ? ` (${esperaEmTexto(maisAntigo)})` : ""}`,
    );
  }
  const assunto = pedacos.join(" · ");

  const linhaFesta = (l: Record<string, unknown>) =>
    [
      String(l.crianca_nome ?? "").trim() || "sem nome",
      quandoDaFesta(l),
      String(l.personagem_nome ?? "").trim(),
      String(l.endereco ?? "").trim(),
    ]
      .filter(Boolean)
      .join(" · ");

  const linhaPedido = (l: Record<string, unknown>) =>
    [
      String(l.responsavel_nome ?? "").trim() || "sem nome",
      String(l.personagem_nome ?? "").trim(),
      l.data_festa ? dataBR(l.data_festa) : "sem data",
      esperaEmTexto(diasEsperando(l.criado_em)),
    ]
      .filter(Boolean)
      .join(" · ");

  const semHoje = doDia.length === 0;
  const semHojeTexto = prox
    ? `Nenhuma festa hoje. A próxima é ${dataBR(prox.data_festa)} — ${String(prox.crianca_nome ?? "").trim() || "sem nome"}${prox.personagem_nome ? `, ${String(prox.personagem_nome)}` : ""}.`
    : "Nenhuma festa hoje, e nenhuma marcada ainda.";

  const texto = [
    "Bom dia.",
    "",
    semHoje ? semHojeTexto : `HOJE — ${doDia.length} ${doDia.length === 1 ? "festa" : "festas"}:`,
    ...(semHoje ? [] : doDia.map((l) => `  ${linhaFesta(l)}`)),
    "",
    ...(abertos.length
      ? [`ESPERANDO RESPOSTA — ${abertos.length}:`, ...abertos.map((l) => `  ${linhaPedido(l)}`), ""]
      : []),
    `Painel: ${PAINEL}`,
  ].join("\n");

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#251629">
  <p style="margin:0 0 16px">Bom dia.</p>
  ${
    semHoje
      ? `<p style="margin:0 0 18px;color:#6b5a66">${esc(semHojeTexto)}</p>`
      : `<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b5a66">Hoje</p>
  <ul style="margin:0 0 18px;padding-left:18px">${doDia.map((l) => `<li style="margin-bottom:4px">${esc(linhaFesta(l))}</li>`).join("")}</ul>`
  }
  ${
    abertos.length
      ? `<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b5a66">Esperando resposta · ${abertos.length}</p>
  <ul style="margin:0 0 18px;padding-left:18px">${abertos
    .map(
      (l) =>
        `<li style="margin-bottom:4px${diasEsperando(l.criado_em) >= 2 ? ";color:#a44e68" : ""}">${esc(linhaPedido(l))}</li>`,
    )
    .join("")}</ul>`
      : ""
  }
  <p style="margin:18px 0 0"><a href="${PAINEL}" style="color:#a44e68">Abrir o painel</a></p>
</div>`;

  return { assunto, texto, html };
}

/**
 * O e-mail das 7 da manhã: o que acontece hoje e o que está esperando resposta.
 *
 * Existe por um motivo concreto. Um pedido real ficou mais de um dia sem
 * resposta porque o painel só conta o que tem para quem decide abrir o painel —
 * e o FAQ promete "respondemos em minutos". Aviso de pedido novo resolve o
 * instante da chegada; este resolve o que ficou para trás.
 *
 * **Só sai quando há o que dizer.** Um "bom dia, hoje nada" diário ensina a
 * ignorar o remetente, e aí o dia que importa passa batido junto. Silêncio aqui
 * significa: nenhuma festa hoje e nenhum pedido esperando. O canal continua
 * sendo exercitado pelos avisos de pedido novo, então caixa muda não vira
 * dúvida sobre o sistema estar de pé.
 */
export async function resumoDoDia(env: Env, hoje: string): Promise<void> {
  const para = destinatarios(env);
  if (para.length === 0) return;

  // Festa é o que tem sinal pago (`reservado`) ou já aconteceu (`realizado`).
  // Um `novo` ou `conversa` marcado para hoje é pedido, não festa — e aparece
  // logo abaixo, em "esperando resposta". Dizer "HOJE: 2 festas" para algo que
  // ninguém confirmou seria pior que não dizer nada.
  //
  // A ordem coloca quem não informou horário no fim — `~` vem depois dos
  // dígitos, o mesmo truque de ordenação que a agenda da tela usa.
  const [festas, esperando, proxima] = await Promise.all([
    env.DB.prepare(
      `SELECT crianca_nome, personagem_nome, horario, periodo, endereco,
              responsavel_nome, responsavel_telefone
         FROM leads
        WHERE data_festa = ? AND status IN ('reservado', 'realizado')
          AND arquivado_em IS NULL
        ORDER BY COALESCE(NULLIF(horario, ''), '~'), criado_em`,
    )
      .bind(hoje)
      .all(),
    env.DB.prepare(
      `SELECT criado_em, responsavel_nome, crianca_nome, personagem_nome, data_festa
         FROM leads WHERE status = 'novo' AND arquivado_em IS NULL
        ORDER BY criado_em`,
    ).all(),
    env.DB.prepare(
      `SELECT data_festa, crianca_nome, personagem_nome
         FROM leads
        WHERE data_festa > ? AND status = 'reservado'
          AND arquivado_em IS NULL
        ORDER BY data_festa LIMIT 1`,
    )
      .bind(hoje)
      .all(),
  ]);

  const montado = montarResumo({
    festas: festas.results as Record<string, unknown>[],
    abertos: esperando.results as Record<string, unknown>[],
    proxima: (proxima.results as Record<string, unknown>[])[0],
  });
  if (!montado) return;

  await env.EMAIL.send({
    to: para,
    from: REMETENTE,
    subject: montado.assunto,
    text: montado.texto,
    html: montado.html,
  });
}
