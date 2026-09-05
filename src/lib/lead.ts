"use client";

/**
 * Envio do lead para o nosso próprio Worker, antes de abrir o WhatsApp.
 *
 * Até aqui o funil terminava num link `wa.me`: quem não apertava enviar dentro
 * do WhatsApp sumia sem deixar rastro. Agora o lead é gravado antes, então
 * mesmo quem desiste no último segundo continua sendo alguém que dá para
 * responder.
 */

const CHAVE_ORIGEM = "fe:origem";

export interface Origem {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  pagina_entrada?: string;
}

/**
 * Guarda de onde a pessoa veio, na primeira página que ela abre.
 * Precisa ser na primeira: depois de navegar, o referrer já é o próprio site.
 */
export function registrarOrigem() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(CHAVE_ORIGEM)) return;

    const p = new URLSearchParams(window.location.search);
    const externo =
      document.referrer && !document.referrer.startsWith(window.location.origin)
        ? document.referrer
        : undefined;

    const origem: Origem = {
      utm_source: p.get("utm_source") ?? undefined,
      utm_medium: p.get("utm_medium") ?? undefined,
      utm_campaign: p.get("utm_campaign") ?? undefined,
      referrer: externo,
      pagina_entrada: window.location.pathname,
    };
    sessionStorage.setItem(CHAVE_ORIGEM, JSON.stringify(origem));
  } catch {
    // Aba anônima ou storage bloqueado: seguir sem origem é melhor que quebrar.
  }
}

export function lerOrigem(): Origem {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_ORIGEM) ?? "{}") as Origem;
  } catch {
    return {};
  }
}

export interface DadosLead {
  personagem_slug?: string;
  personagem_nome?: string;
  mundo_nome?: string;
  data_festa?: string;
  periodo?: string;
  horario?: string;
  endereco?: string;
  tipo_local?: string;
  crianca_nome?: string;
  crianca_idade?: string;
  observacao?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
}

/**
 * Dispara o lead sem bloquear nada.
 *
 * `sendBeacon` é essencial aqui: ele entrega em segundo plano e sobrevive à
 * navegação. Se isto virasse um `await fetch` antes do `window.open`, o
 * bloqueador de pop-up mataria a janela do WhatsApp — trocaríamos "perder o
 * lead" por "perder a conversa".
 */
export function enviarLead(dados: DadosLead) {
  if (typeof window === "undefined") return;
  const corpo = JSON.stringify({ ...dados, ...lerOrigem() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/lead", new Blob([corpo], { type: "application/json" }));
      return;
    }
    // Navegador sem sendBeacon: keepalive faz o mesmo papel.
    void fetch("/api/lead", {
      method: "POST",
      body: corpo,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Gravar o lead nunca pode atrapalhar quem está reservando.
  }
}

/**
 * Data no fuso de quem preencheu, como YYYY-MM-DD.
 *
 * O calendário devolve um Date à meia-noite local; `toISOString()` converteria
 * para UTC e em São Paulo (UTC-3) jogaria a reserva para o dia anterior.
 */
export function dataLocalISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
