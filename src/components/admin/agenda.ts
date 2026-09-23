/**
 * As contas da agenda, sem React.
 *
 * O painel antes era a tabela do banco desenhada na tela: ordenava por
 * `criado_em` porque era o índice que existia. Só que este negócio vende
 * DATAS — a festa de sábado importa mais que o pedido que chegou por último.
 * Tudo aqui existe para virar essa ordem.
 *
 * Nada neste arquivo toca no DOM nem no estado, de propósito: cada número da
 * faixa de resumo pode ser conferido contra um `SELECT` no banco.
 */

export interface Lead {
  id: string;
  criado_em: string;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  personagem_nome: string | null;
  mundo_nome: string | null;
  data_festa: string | null;
  periodo: string | null;
  horario: string | null;
  endereco: string | null;
  tipo_local: string | null;
  crianca_nome: string | null;
  crianca_idade: string | null;
  observacao: string | null;
  notas: string | null;
  personagem_slug: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  pagina_entrada: string | null;
  status: string;
}

/* ——— datas ——— */

/**
 * Hoje em São Paulo, como YYYY-MM-DD.
 *
 * `en-CA` devolve exatamente esse formato, o mesmo de `data_festa` no banco —
 * o que deixa comparar data com `<` e `>` de texto, sem construir Date nenhum.
 * É a única comparação de data que não tem armadilha de fuso.
 */
export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

/** Soma dias a um YYYY-MM-DD e devolve outro YYYY-MM-DD. */
export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const dt = new Date(a, m - 1, d + dias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

const fmtDiaLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const fmtDiaCurto = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "long" });
const fmtMesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

/**
 * `data_festa` é YYYY-MM-DD puro, sem hora e sem fuso. `new Date(iso)` nele
 * assumiria UTC e em São Paulo voltaria um dia — daí montar o Date por partes.
 */
function comoData(iso: string): Date | null {
  const [a, m, d] = iso.split("-").map(Number);
  return a && m && d ? new Date(a, m - 1, d) : null;
}

/** 2026-09-12 → "sábado, 12 de setembro". */
export function rotuloDia(iso: string): string {
  const d = comoData(iso);
  return d ? fmtDiaLongo.format(d) : iso;
}

/** 2026-09-12 → "12/09". */
export function diaCurto(iso: string): string {
  const d = comoData(iso);
  return d ? fmtDiaCurto.format(d) : iso;
}

/** "outubro" no ano corrente, "junho de 2027" fora dele. */
export function rotuloMes(iso: string, hoje: string): string {
  const d = comoData(iso);
  if (!d) return iso;
  return iso.slice(0, 4) === hoje.slice(0, 4) ? fmtMes.format(d) : fmtMesAno.format(d);
}

/** "15:00" → "15h"; "16:30" → "16h30". O resto passa como veio. */
export function horaBonita(h: string | null): string | null {
  if (!h) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(h.trim());
  if (!m) return h.trim();
  return m[2] === "00" ? `${Number(m[1])}h` : `${Number(m[1])}h${m[2]}`;
}

/** O banco antigo guarda "tarde" e o formulário manda "Tarde". Na tela, um só. */
export function periodoBonito(p: string | null): string | null {
  const t = (p ?? "").trim();
  return t ? t[0].toUpperCase() + t.slice(1).toLowerCase() : null;
}

/**
 * Quanto tempo o pedido está esperando, em texto curto.
 *
 * O selo é o único sinal de urgência da tela, então precisa ser lido de relance:
 * "há 3 dias" diz mais que "07/09, 14:32" para quem está decidindo o que
 * responder primeiro.
 */
export function idadeEmTexto(criadoEm: string, agora: Date = new Date()): string {
  const min = Math.floor((agora.getTime() - new Date(criadoEm).getTime()) / 60000);
  if (!Number.isFinite(min) || min < 2) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
  const meses = Math.floor(dias / 30);
  return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;
}

/** Dias inteiros desde que o pedido chegou. */
export function diasDesde(criadoEm: string, agora: Date = new Date()): number {
  return Math.floor((agora.getTime() - new Date(criadoEm).getTime()) / 86400000);
}

/* ——— o ciclo de vida ——— */

/**
 * Estados que significam "isto é uma festa que vai acontecer ou aconteceu".
 *
 * `novo` e `conversa` são pedidos: alguém perguntou. Contá-los como festa
 * inflaria a agenda com o que ninguém confirmou — e era o que acontecia quando
 * a única exclusão era `perdido`. Só `reservado` tem sinal pago.
 */
export const EH_FESTA = new Set(["reservado", "realizado"]);

/** Ocupa a data de verdade. `realizado` já passou; não disputa nada. */
export const OCUPA_DATA = new Set(["reservado"]);

/* ——— linha do tempo ——— */

export interface Evento {
  lead_id: string;
  em: string;
  tipo: string;
  detalhe: string | null;
}

/**
 * "chegou 3/set · em conversa 4/set · reservado 6/set".
 *
 * O painel sabia em que estado o pedido está e nada sobre como chegou lá:
 * `conversa` não tem data própria, então não dava para saber se a resposta saiu
 * ontem ou há duas semanas — só há quanto tempo o pedido existe. Uma linha
 * resolve, e cabe num cartão de celular.
 *
 * Pedido antigo não tem histórico nenhum, e isso é honesto: a linha mostra só
 * "chegou", porque é tudo o que se sabe. Inventar transições seria pior.
 */
export function linhaDoTempo(lead: Lead, eventos: Evento[], rotulo: (s: string) => string): string {
  const meus = eventos
    .filter((e) => e.lead_id === lead.id && e.tipo === "status" && e.detalhe)
    .sort((a, b) => a.em.localeCompare(b.em));

  const partes = [`chegou ${diaCurto(hojeEmSaoPaulo(new Date(lead.criado_em)))}`];
  for (const e of meus) {
    partes.push(`${rotulo(e.detalhe as string)} ${diaCurto(hojeEmSaoPaulo(new Date(e.em)))}`);
  }
  return partes.join(" · ");
}

/* ——— choque de agenda ——— */

/**
 * O banco local guarda "tarde" e o formulário manda "Tarde"; um dia alguém
 * digita "TARDE". Comparar sem normalizar deixaria passar o choque exatamente
 * nos dados mais antigos.
 */
function periodoNormal(p: string | null): string {
  return (p ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export interface Choque {
  /** Mesmo dia E mesmo período: não dá para atender os dois. */
  mesmoPeriodo: boolean;
  /** Nome de quem pediu a outra festa do mesmo dia. */
  outros: string[];
}

/**
 * Quem disputa o mesmo dia com quem.
 *
 * `perdido` fica de fora — pedido recusado não ocupa data. `reservado` contra
 * `novo` CONTA: é justamente a hora de avisar a segunda família que o dia já
 * foi. E o cálculo roda sobre a lista inteira, não sobre o grupo da tela: os
 * pedidos por responder moram na caixa de entrada, e sem isso o choque mais
 * importante — duas famílias querendo o mesmo sábado — nunca apareceria.
 */
export function choques(leads: Lead[]): Map<string, Choque> {
  const porDia = new Map<string, Lead[]>();
  for (const l of leads) {
    if (!l.data_festa || l.status === "perdido") continue;
    const lista = porDia.get(l.data_festa);
    if (lista) lista.push(l);
    else porDia.set(l.data_festa, [l]);
  }

  const saida = new Map<string, Choque>();
  for (const lista of porDia.values()) {
    if (lista.length < 2) continue;
    for (const l of lista) {
      const outros = lista.filter((o) => o.id !== l.id);
      saida.set(l.id, {
        mesmoPeriodo: outros.some(
          (o) => periodoNormal(o.periodo) !== "" && periodoNormal(o.periodo) === periodoNormal(l.periodo),
        ),
        outros: outros.map((o) => o.responsavel_nome ?? "sem nome"),
      });
    }
  }
  return saida;
}

/* ——— agrupamento ——— */

/** Pedido que já tem data marcada — o que a agenda sabe posicionar. */
type ComData = Lead & { data_festa: string };

function temData(l: Lead): l is ComData {
  return typeof l.data_festa === "string" && l.data_festa !== "";
}

export interface Dia {
  data: string;
  leads: Lead[];
}

export interface Mes {
  chave: string;
  leads: Lead[];
}

export interface Agenda {
  /** Status `novo`, quem espera há mais tempo primeiro. */
  aResponder: Lead[];
  proximos: Dia[];
  adiante: Mes[];
  semData: Lead[];
  passados: Lead[];
}

/** Hora primeiro, depois ordem de chegada. Sem horário vai para o fim do dia. */
function porHorario(a: Lead, b: Lead): number {
  const ha = a.horario ?? "~";
  const hb = b.horario ?? "~";
  return ha === hb ? a.criado_em.localeCompare(b.criado_em) : ha.localeCompare(hb);
}

/**
 * Um pedido aparece num lugar só.
 *
 * Enquanto está `novo` ele mora em "precisam de resposta"; ao ser marcado como
 * respondido, desce para o dia dele. É o que faz marcar a situação valer alguma
 * coisa — move o pedido, em vez de só pintar um botão de dourado.
 */
export function agrupar(leads: Lead[], hoje: string = hojeEmSaoPaulo()): Agenda {
  const limite = somarDias(hoje, 7);

  const aResponder = leads
    .filter((l) => l.status === "novo")
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em));

  const restantes = leads.filter((l) => l.status !== "novo");

  const semData = restantes
    .filter((l) => !temData(l))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));

  const comData = restantes.filter(temData);

  const passados = comData
    .filter((l) => l.data_festa < hoje)
    .sort((a, b) => b.data_festa.localeCompare(a.data_festa));

  const porDia = new Map<string, ComData[]>();
  const porMes = new Map<string, ComData[]>();
  for (const l of comData) {
    if (l.data_festa < hoje) continue;
    const perto = l.data_festa < limite;
    const alvo = perto ? porDia : porMes;
    const chave = perto ? l.data_festa : l.data_festa.slice(0, 7);
    const lista = alvo.get(chave);
    if (lista) lista.push(l);
    else alvo.set(chave, [l]);
  }

  const proximos = [...porDia.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, ls]) => ({ data, leads: ls.sort(porHorario) }));

  const adiante = [...porMes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([chave, ls]) => ({
      chave,
      leads: ls.sort((a, b) =>
        a.data_festa === b.data_festa ? porHorario(a, b) : a.data_festa.localeCompare(b.data_festa),
      ),
    }));

  return { aResponder, proximos, adiante, semData, passados };
}

/* ——— faixa de resumo ——— */

export interface Resumo {
  noMes: number;
  mesAtual: string;
  aResponder: number;
  esperaMaisAntiga: number;
  festas30: number;
  campeao: [nome: string, vezes: number] | null;
}

const fmtMesSozinho = new Intl.DateTimeFormat("pt-BR", { month: "long" });

/**
 * Os quatro números que a dona olharia antes de qualquer outra coisa.
 *
 * Tudo sai da lista já carregada — nenhuma consulta a mais. Em compensação,
 * eles valem para os pedidos que vieram: quem chama precisa avisar quando a
 * lista bateu no teto, senão a faixa mente sobre o próprio total.
 */
export function resumo(leads: Lead[], agora: Date = new Date()): Resumo {
  const hoje = hojeEmSaoPaulo(agora);
  const mes = hoje.slice(0, 7);
  const daqui30 = somarDias(hoje, 30);

  // `criado_em` é um instante UTC; o mês tem que ser o de São Paulo, senão das
  // 21h à meia-noite do dia 30 o pedido cai no mês errado.
  const noMes = leads.filter((l) => hojeEmSaoPaulo(new Date(l.criado_em)).startsWith(mes)).length;

  const novos = leads.filter((l) => l.status === "novo");
  const esperaMaisAntiga = novos.reduce((max, l) => Math.max(max, diasDesde(l.criado_em, agora)), 0);

  // Só festa confirmada entra na conta. Antes qualquer pedido com data contava,
  // e o número dizia "quantas pessoas pediram", não "quantas festas eu tenho".
  const festas30 = leads.filter(
    (l) => EH_FESTA.has(l.status) && l.data_festa && l.data_festa >= hoje && l.data_festa <= daqui30,
  ).length;

  const contagem = new Map<string, number>();
  for (const l of leads) {
    if (!l.personagem_nome) continue;
    contagem.set(l.personagem_nome, (contagem.get(l.personagem_nome) ?? 0) + 1);
  }
  const campeao = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const [ano, m] = mes.split("-").map(Number);

  return {
    noMes,
    mesAtual: fmtMesSozinho.format(new Date(ano, m - 1, 1)),
    aResponder: novos.length,
    esperaMaisAntiga,
    festas30,
    campeao,
  };
}

/* ——— de onde veio o pedido ——— */

/**
 * Canal legível de um pedido.
 *
 * Estes campos já eram gravados em toda linha da tabela e nunca apareciam na
 * tela — dava para ver quantas VISITAS vieram do Instagram, mas não de onde
 * veio o pedido que virou festa. Visita é curiosidade; pedido é dinheiro, e é
 * essa razão que decide onde investir.
 *
 * A ordem é `utm_source` primeiro (é o que a etiqueta do link declara), depois
 * o domínio de quem indicou. Sem os dois, é "direto" — que quase nunca quer
 * dizer "digitou o endereço": é link de app de mensagem, ou link de bio sem
 * etiqueta. Por isso `incerto`, para a tela poder explicar em vez de mentir.
 */
const CANAIS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$|^(ig|instagram)$/, "Instagram"],
  [/(^|\.)facebook\.com$|^(fb|facebook)$/, "Facebook"],
  [/(^|\.)google\./, "Google"],
  [/googlequicksearchbox|^google$/, "Google"],
  [/(^|\.)(whatsapp\.com|wa\.me)$|^(wpp|whatsapp)$/, "WhatsApp"],
  [/(^|\.)tiktok\.com$|^tiktok$/, "TikTok"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$|^youtube$/, "YouTube"],
  [/(^|\.)linktr\.ee$|^linktree$/, "Linktree"],
  [/(^|\.)bing\.com$|^bing$/, "Bing"],
];

export interface Origem {
  canal: string;
  /** Campanha ou meio, quando a etiqueta trouxe — `campanha halloween-out`, `bio`. */
  detalhe: string | null;
  /** Não havia etiqueta nem quem indicou: o "direto" que não quer dizer nada. */
  incerto: boolean;
}

export function origemDoLead(lead: Lead): Origem {
  const detalhe = lead.utm_campaign
    ? `campanha ${lead.utm_campaign}`
    : (lead.utm_medium ?? null);

  const bruto = (lead.utm_source ?? hostDe(lead.referrer) ?? "").trim().toLowerCase();
  if (!bruto) return { canal: "direto", detalhe, incerto: true };

  // `l.instagram.com` e `www.google.com` são o mesmo canal que `instagram.com`.
  const limpo = bruto.replace(/^(www|l|m|lm)\./, "");
  for (const [padrao, nome] of CANAIS) {
    if (padrao.test(limpo) || padrao.test(bruto)) return { canal: nome, detalhe, incerto: false };
  }
  return { canal: limpo, detalhe, incerto: false };
}

/** O referrer é gravado inteiro; aqui interessa só quem indicou. */
function hostDe(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    // Já veio só o domínio, ou veio algo que não é URL — o texto serve.
    return referrer.split("/")[0] || null;
  }
}
