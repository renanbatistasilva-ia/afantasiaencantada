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
const REMETENTE = "avisos@afantasiaencantada.com";

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
 * Monta e envia. `novo` diferencia primeiro envio de correção: a tela de
 * confirmação oferece "revisar os dados", e sem essa distinção uma correção
 * chegaria como se fosse um segundo pedido.
 */
export async function avisarPedido(env: Env, dados: DadosAviso, novo: boolean): Promise<void> {
  // Aceita vários endereços separados por vírgula. É o que permite começar
  // enviando para quem consegue verificar hoje e acrescentar a caixa da empresa
  // depois, com um `wrangler secret put` — sem tocar em código nem publicar.
  const para = (env.AVISO_EMAIL_PARA ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

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
