"use client";

/**
 * Medição de tráfego, do lado do navegador.
 *
 * O que já existia mede quem **completou** a reserva. Isto mede quem chegou e
 * desistiu — que é onde mora a informação capaz de mudar decisão.
 *
 * Duas escolhas de desenho valem explicação:
 *
 * **Os eventos vão em lote.** Um envio por evento gastaria o teto de 100 mil
 * requisições de Worker por dia, e quando ele estoura as rotas de `/api/*`
 * passam a devolver 429 em vez de cair nos arquivos estáticos — levando junto a
 * gravação de leads. Como o site navega sem recarregar a página, a fila
 * sobrevive à troca de rota e um envio costuma cobrir a visita inteira.
 *
 * **Nada depende de evento de saída.** `pagehide` e `visibilitychange` são
 * instáveis no Safari do iPhone, justamente onde está boa parte do público. Por
 * isso cada passo é registrado quando é **alcançado**, e a desistência sai por
 * subtração no painel. Os eventos de saída existem só como reforço.
 */

import { lerOrigem } from "./lead";

const CHAVE_VISITA = "fe:visita";
const CHAVE_VISTAS = "fe:vistas";
const CHAVE_OPTOUT = "fe:naomedir";

const MAX_FILA = 12;
/** Teto por carregamento de página: um laço com defeito não vira enxurrada. */
const MAX_ENVIOS = 8;
const ESPERA = 1500;

export type Tipo = "pv" | "passo" | "permanencia" | "lead";

interface Evento {
  t: Tipo;
  c?: string;
  p?: string;
  s?: number;
}

let fila: Evento[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let envios = 0;

/**
 * Um número sorteado na hora, que vive só enquanto a aba estiver aberta.
 *
 * Não é cookie, não atravessa aba nem domínio, e some ao fechar. Serve para não
 * contar cinco recarregamentos como cinco visitas — nada além disso.
 */
function idDaVisita(): string {
  try {
    let id = sessionStorage.getItem(CHAVE_VISITA);
    if (!id) {
      id = crypto.randomUUID().slice(0, 22);
      sessionStorage.setItem(CHAVE_VISITA, id);
    }
    return id;
  } catch {
    // Aba anônima ou armazenamento bloqueado: mesma decisão de registrarOrigem,
    // seguir sem identificador é melhor que quebrar.
    return "";
  }
}

/**
 * Respeita quem pediu para não ser medido, e a própria dona no aparelho dela.
 *
 * Sem cache, de propósito. A resposta já foi guardada numa variável de módulo, e
 * isso quebrava o opt-out que a página de privacidade promete: o link para
 * `/?fe=off` navega sem recarregar, então o módulo não é reavaliado e o
 * parâmetro nunca chegava a ser lido. Ler `localStorage` a cada evento não custa
 * nada perto da requisição de rede que vem depois.
 */
function medindo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("fe") === "off") localStorage.setItem(CHAVE_OPTOUT, "1");
    if (p.get("fe") === "on") localStorage.removeItem(CHAVE_OPTOUT);

    const nav = navigator as Navigator & { globalPrivacyControl?: boolean; webdriver?: boolean };
    return (
      localStorage.getItem(CHAVE_OPTOUT) !== "1" &&
      nav.globalPrivacyControl !== true &&
      navigator.doNotTrack !== "1" &&
      nav.webdriver !== true
    );
  } catch {
    // Armazenamento bloqueado: não dá para saber se pediu opt-out. Medir é o
    // padrão, e nenhum dado pessoal está em jogo.
    return true;
  }
}

/** Conjunto do que já foi contado nesta visita, para não contar duas vezes. */
function jaContado(marca: string): boolean {
  try {
    const bruto = sessionStorage.getItem(CHAVE_VISTAS);
    const vistos: string[] = bruto ? JSON.parse(bruto) : [];
    if (vistos.includes(marca)) return true;
    // O teto evita que uma navegação muito longa encha o armazenamento.
    if (vistos.length < 200) {
      vistos.push(marca);
      sessionStorage.setItem(CHAVE_VISTAS, JSON.stringify(vistos));
    }
    return false;
  } catch {
    return false;
  }
}

function descarregar() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (fila.length === 0 || envios >= MAX_ENVIOS) return;

  // "Primeira remessa da visita" tem que morar no sessionStorage, não numa
  // variável: `envios` zera a cada carregamento duro de página, e quem
  // recarregasse ou clicasse num link que recarrega seria contado como visita
  // nova a cada vez.
  const primeiro = !jaContado("visita");
  const corpo = JSON.stringify({ v: idDaVisita(), n: primeiro ? 1 : 0, e: fila, ...lerOrigem() });
  fila = [];
  envios++;

  try {
    // O sendBeacon devolve false quando o navegador se recusa a enfileirar.
    // Aqui não dá para ignorar esse retorno como o envio de lead faz: o pacote
    // carrega vários eventos de uma vez, e perdê-lo perde a visita inteira.
    const blob = new Blob([corpo], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/e", blob)) return;

    void fetch("/api/e", {
      method: "POST",
      body: corpo,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Medir nunca pode atrapalhar quem está navegando.
  }
}

function enfileirar(ev: Evento) {
  if (!medindo()) return;
  if (fila.length >= MAX_FILA) descarregar();
  fila.push(ev);
  if (timer) clearTimeout(timer);
  timer = setTimeout(descarregar, ESPERA);
}

/** Uma página vista, no máximo uma vez por caminho por visita. */
export function medirPagina(caminho: string) {
  if (!medindo() || jaContado(`pv:${caminho}`)) return;
  enfileirar({ t: "pv", c: caminho });
}

/** Um passo do formulário alcançado, no máximo uma vez por visita. */
export function medirPasso(passo: string) {
  if (!medindo() || jaContado(`passo:${passo}`)) return;
  enfileirar({ t: "passo", p: passo });
}

/**
 * Ficou mais que `segundos` nesta página.
 *
 * Limiar em vez de média porque média exigiria saber a hora da saída, e é
 * exatamente isso que não dá para medir com confiança no celular. "23 das 40
 * pessoas ficaram mais de 15 segundos" também se lê melhor que "média 00:34".
 */
export function medirPermanencia(caminho: string, segundos: number) {
  if (!medindo() || jaContado(`perm:${caminho}:${segundos}`)) return;
  enfileirar({ t: "permanencia", c: caminho, s: segundos });
}

export function medirLead() {
  if (!medindo()) return;
  enfileirar({ t: "lead" });
  descarregar();
}

if (typeof window !== "undefined") {
  // Reforço, nunca a única via: ver a nota sobre o Safari no cabeçalho.
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") descarregar();
  });
  addEventListener("pagehide", descarregar);
}
