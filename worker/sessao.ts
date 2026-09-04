/**
 * Sessão e senha do painel de leads.
 *
 * Duas coisas separadas de propósito, com dois segredos diferentes:
 *
 * - `PAINEL_SENHA_HASH` confere quem está entrando.
 * - `PAINEL_SESSAO_SEGREDO` assina o cookie de quem já entrou.
 *
 * Se o cookie fosse assinado com a senha, um cookie capturado viraria um oráculo:
 * daria para testar senhas candidatas offline, sem rede e sem freio, até achar a
 * que reproduz a assinatura. Uma senha em português cairia em minutos.
 */

const COD = new TextEncoder();

/**
 * O prefixo `__Host-` é de graça e vale a pena: o navegador passa a exigir
 * Secure, Path=/ e ausência de Domain, então nenhum subdomínio consegue plantar
 * ou sobrescrever este cookie. Exige HTTPS, que não existe no `wrangler dev`.
 */
const COOKIE_SEGURO = "__Host-fe_sessao";
const COOKIE_LOCAL = "fe_sessao";

/**
 * Sete dias, deslizantes. Exigir senha todo dia de uma pessoa não técnica faz
 * ela escolher senha fraca ou anotar num papel — os dois piores que a janela
 * maior. Quem abre o painel toda semana nunca é desconectada.
 */
const DURACAO = 7 * 24 * 60 * 60;
const RENOVAR_APOS = 60 * 60;

/* ——— base64 sem padding, seguro em URL e em cookie ——— */

function b64url(dados: ArrayBuffer): string {
  const bytes = new Uint8Array(dados);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Lança em entrada malformada — quem chama trata como cookie inválido. */
function deB64url(txt: string): Uint8Array<ArrayBuffer> {
  const b64 = txt.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/* ——— cookie de sessão ——— */

async function chaveHmac(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    COD.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export function nomeCookie(url: URL): string {
  return url.protocol === "https:" ? COOKIE_SEGURO : COOKIE_LOCAL;
}

function atributos(url: URL, valor: string, idade: number): string {
  const partes = [
    `${nomeCookie(url)}=${valor}`,
    "Path=/",
    `Max-Age=${idade}`,
    "HttpOnly",
    "SameSite=Strict",
  ];
  // Secure quebraria o cookie no http do `wrangler dev`; em produção é sempre https.
  if (url.protocol === "https:") partes.push("Secure");
  return partes.join("; ");
}

export async function emitirCookie(segredo: string, url: URL): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DURACAO;
  // O nonce só existe para dois logins nunca gerarem a mesma string de cookie.
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(9)).buffer);
  const corpo = `v1.${exp}.${nonce}`;
  const assinatura = await crypto.subtle.sign("HMAC", await chaveHmac(segredo), COD.encode(corpo));
  return atributos(url, `${corpo}.${b64url(assinatura)}`, DURACAO);
}

export function cookieVazio(url: URL): string {
  return atributos(url, "", 0);
}

export function lerCookie(cabecalho: string | null, nome: string): string | null {
  if (!cabecalho) return null;
  for (const parte of cabecalho.split(";")) {
    const igual = parte.indexOf("=");
    if (igual < 0) continue;
    if (parte.slice(0, igual).trim() === nome) return parte.slice(igual + 1).trim();
  }
  return null;
}

/**
 * Devolve quantos segundos ainda faltam para a sessão expirar, ou null se o
 * cookie não presta.
 *
 * A ordem importa: a assinatura é conferida ANTES de o prazo ser lido. Ler o
 * prazo primeiro seria decidir com base em dado que o visitante escolheu.
 */
export async function conferirSessao(
  segredo: string,
  cabecalhoCookie: string | null,
  url: URL,
): Promise<number | null> {
  const bruto = lerCookie(cabecalhoCookie, nomeCookie(url));
  if (!bruto) return null;

  const partes = bruto.split(".");
  if (partes.length !== 4 || partes[0] !== "v1") return null;
  const corpo = `${partes[0]}.${partes[1]}.${partes[2]}`;

  let recebida: Uint8Array<ArrayBuffer>;
  try {
    recebida = deB64url(partes[3]);
  } catch {
    return null;
  }

  const esperada = new Uint8Array(
    await crypto.subtle.sign("HMAC", await chaveHmac(segredo), COD.encode(corpo)),
  );

  // timingSafeEqual LANÇA se os tamanhos diferem. O tamanho de um HMAC-SHA256 é
  // público (32 bytes), então comparar tamanhos antes não vaza nada.
  if (recebida.byteLength !== esperada.byteLength) return null;
  if (!crypto.subtle.timingSafeEqual(recebida, esperada)) return null;

  const exp = Number(partes[1]);
  if (!Number.isFinite(exp)) return null;
  const restante = exp - Math.floor(Date.now() / 1000);
  return restante > 0 ? restante : null;
}

export function precisaRenovar(restante: number): boolean {
  return restante < DURACAO - RENOVAR_APOS;
}

/* ——— senha ——— */

async function derivar(senha: string, sal: Uint8Array, iteracoes: number): Promise<ArrayBuffer> {
  const base = await crypto.subtle.importKey(
    "raw",
    // Acento digitado no iPhone (NFC) e gerado no macOS (que gosta de NFD) são
    // bytes diferentes para a mesma senha. Normalizar dos dois lados resolve.
    COD.encode(senha.normalize("NFC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iteracoes },
    base,
    256,
  );
}

/**
 * Confere a senha contra `pbkdf2$<iterações>$<sal>$<derivada>`.
 *
 * O número de iterações mora dentro do segredo justamente para poder ser
 * baixado sem tocar em código, caso o custo de CPU estoure o limite do plano.
 */
export async function senhaConfere(guardado: string, enviada: string): Promise<boolean> {
  const [algo, iterTxt, salTxt, dkTxt] = guardado.split("$");
  if (algo !== "pbkdf2") return false;

  const iteracoes = Number(iterTxt);
  if (!Number.isInteger(iteracoes) || iteracoes < 1000 || iteracoes > 600_000) return false;

  let sal: Uint8Array<ArrayBuffer>;
  let esperada: Uint8Array<ArrayBuffer>;
  try {
    sal = deB64url(salTxt);
    esperada = deB64url(dkTxt);
  } catch {
    return false;
  }

  const obtida = new Uint8Array(await derivar(enviada, sal, iteracoes));
  if (obtida.byteLength !== esperada.byteLength) return false;
  return crypto.subtle.timingSafeEqual(obtida, esperada);
}
