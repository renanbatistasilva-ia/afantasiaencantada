/**
 * Worker da Fantasia Encantada.
 *
 * O site continua sendo servido como arquivos estáticos pela camada de assets
 * do Cloudflare — este Worker só é invocado nas rotas declaradas em
 * `run_worker_first` no wrangler.jsonc (hoje, `/api/*`).
 *
 * Qualquer outra coisa que chegue aqui é repassada para os assets, para o site
 * nunca depender deste código para funcionar.
 *
 * Duas famílias de rota convivem aqui:
 *
 * - `/api/lead`, pública, onde o formulário de reserva grava. Ela é casada
 *   ANTES de qualquer verificação do painel e não compartilha estado com ele:
 *   um painel quebrado não pode derrubar a captura de leads.
 * - `/api/admin/*`, atrás de senha.
 */

import { lerAnalitica, receberEventos } from "./analitica";
import {
  conferirSessao,
  cookieVazio,
  emitirCookie,
  precisaRenovar,
  senhaConfere,
} from "./sessao";

// O tipo Env vem de worker-configuration.d.ts, gerado por `wrangler types` a
// partir do próprio wrangler.jsonc — assim binding novo não passa despercebido.

/** Corpo maior que isto é recusado sem nem tentar interpretar. */
const LIMITE_CORPO = 8 * 1024;

/** Campos de texto: corta em tamanhos sãos antes de gravar. */
const LIMITES: Record<string, number> = {
  responsavel_nome: 120,
  responsavel_telefone: 20,
  personagem_slug: 80,
  personagem_nome: 120,
  mundo_nome: 120,
  data_festa: 10,
  periodo: 20,
  horario: 40,
  endereco: 200,
  tipo_local: 40,
  crianca_nome: 120,
  crianca_idade: 10,
  observacao: 1000,
  utm_source: 120,
  utm_medium: 120,
  utm_campaign: 120,
  referrer: 300,
  pagina_entrada: 300,
};

function texto(valor: unknown, campo: string): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  if (!limpo) return null;
  return limpo.slice(0, LIMITES[campo] ?? 200);
}

/** Celular brasileiro, só dígitos. Mesma regra do formulário. */
function telefoneValido(v: string | null): boolean {
  if (!v) return false;
  const d = v.replace(/\D/g, "");
  return d.length === 11 && Number(d.slice(0, 2)) >= 11 && d[2] === "9";
}

async function gravarLead(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ erro: "método não permitido" }, { status: 405 });
  }

  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > LIMITE_CORPO) {
    return Response.json({ erro: "corpo grande demais" }, { status: 413 });
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ erro: "json inválido" }, { status: 400 });
  }

  const campos = Object.fromEntries(
    Object.keys(LIMITES).map((k) => [k, texto(corpo[k], k)]),
  ) as Record<string, string | null>;

  // O mínimo para o lead ter serventia: dá para responder e sabe-se do que se trata.
  if (!campos.responsavel_nome || !telefoneValido(campos.responsavel_telefone)) {
    return Response.json({ erro: "contato inválido" }, { status: 400 });
  }
  if (!campos.personagem_slug) {
    return Response.json({ erro: "personagem ausente" }, { status: 400 });
  }

  const colunas = ["id", "criado_em", ...Object.keys(LIMITES)];
  const valores = [crypto.randomUUID(), new Date().toISOString(), ...Object.keys(LIMITES).map((k) => campos[k])];

  try {
    await env.DB.prepare(
      `INSERT INTO leads (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")})`,
    )
      .bind(...valores)
      .run();
  } catch {
    // Nunca quebrar a experiência de quem está reservando por causa do banco.
    return Response.json({ erro: "falha ao gravar" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}

/* ——— painel ——— */

const PREFIXO_LEAD = "/api/admin/leads/";
const STATUS_VALIDOS = new Set(["novo", "respondido", "fechado", "perdido"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resposta do painel nunca pode ser guardada em cache: são nomes e idades de
 * criança, e depender da heurística da borda para isso seria imprudente.
 */
function semCache(r: Response): Response {
  r.headers.set("Cache-Control", "no-store");
  r.headers.set("Vary", "Cookie");
  r.headers.set("X-Robots-Tag", "noindex");
  r.headers.set("X-Content-Type-Options", "nosniff");
  return r;
}

function erro(msg: string, status: number): Response {
  return semCache(Response.json({ erro: msg }, { status }));
}

/**
 * Segredo ausente tem que fechar a porta, não abri-la.
 *
 * Sem esta guarda, `undefined` viraria a chave HMAC literal "undefined" — chave
 * previsível, e portanto painel aberto para quem souber disso.
 */
function segredos(env: Env): { senha: string; sessao: string } | null {
  const senha = env.PAINEL_SENHA_HASH;
  const sessao = env.PAINEL_SESSAO_SEGREDO;
  if (typeof senha !== "string" || senha.length < 20) return null;
  if (typeof sessao !== "string" || sessao.length < 32) return null;
  return { senha, sessao };
}

/**
 * CSRF em profundidade. O SameSite=Strict já barra o cookie em requisição vinda
 * de outro site; estas duas linhas custam pouco e fecham o resto: o navegador
 * manda Origin em todo método que não seja GET, e formulário HTML de outro site
 * não consegue mandar Content-Type: application/json.
 */
function mesmaOrigem(request: Request, url: URL): boolean {
  return request.headers.get("Origin") === url.origin;
}

function ehJson(request: Request): boolean {
  return (request.headers.get("Content-Type") ?? "").startsWith("application/json");
}

async function entrar(
  request: Request,
  env: Env,
  url: URL,
  chaves: { senha: string; sessao: string },
): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "desconhecido";
  // O freio por IP trava quem está chutando; o global impede que um ataque
  // distribuído gaste CPU de PBKDF2 sem teto. 60/min ainda sobra para a dona.
  //
  // Os bindings são opcionais de propósito: se a conta não os oferecer, o
  // painel continua de pé com a senha como defesa, em vez de o Worker inteiro
  // falhar ao iniciar e derrubar junto a gravação de leads.
  const [porIp, global] = await Promise.all([
    env.LIMITE_LOGIN?.limit({ key: ip }) ?? Promise.resolve({ success: true }),
    env.LIMITE_GLOBAL?.limit({ key: "login" }) ?? Promise.resolve({ success: true }),
  ]);
  if (!porIp.success || !global.success) {
    return semCache(
      Response.json(
        { erro: "muitas tentativas, espere um minuto" },
        { status: 429, headers: { "Retry-After": "60" } },
      ),
    );
  }

  if (!ehJson(request)) return erro("formato inválido", 415);

  const corpo = (await request.json().catch(() => null)) as { senha?: unknown } | null;
  // O trim é deliberado: teclado de celular adiciona espaço com facilidade.
  const senha = typeof corpo?.senha === "string" ? corpo.senha.trim() : "";
  // 200 é folga de sobra e evita alguém pagar CPU de PBKDF2 com um megabyte.
  if (!senha || senha.length > 200) return erro("senha inválida", 401);

  if (!(await senhaConfere(chaves.senha, senha))) return erro("senha inválida", 401);

  return semCache(
    Response.json({ ok: true }, { headers: { "Set-Cookie": await emitirCookie(chaves.sessao, url) } }),
  );
}

async function listarLeads(env: Env, url: URL): Promise<Response> {
  const filtros: string[] = [];
  const valores: unknown[] = [];

  const status = url.searchParams.get("status");
  if (status && STATUS_VALIDOS.has(status)) {
    filtros.push("status = ?");
    valores.push(status);
  }

  const limite = Math.min(Math.max(Number(url.searchParams.get("limite")) || 100, 1), 200);
  const onde = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(
    `SELECT id, criado_em, responsavel_nome, responsavel_telefone, personagem_slug,
            personagem_nome, mundo_nome, data_festa, periodo, horario, endereco,
            tipo_local, crianca_nome, crianca_idade, observacao,
            utm_source, utm_medium, utm_campaign, referrer, pagina_entrada, status
       FROM leads ${onde}
      ORDER BY criado_em DESC
      LIMIT ?`,
  )
    .bind(...valores, limite)
    .all();

  return semCache(Response.json({ leads: results }));
}

async function mudarStatus(request: Request, env: Env, id: string): Promise<Response> {
  if (!ehJson(request)) return erro("formato inválido", 415);

  const corpo = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = typeof corpo?.status === "string" ? corpo.status : "";
  if (!STATUS_VALIDOS.has(status)) return erro("status inválido", 400);

  const r = await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, id).run();
  if (r.meta.changes === 0) return erro("lead não encontrado", 404);
  return semCache(Response.json({ ok: true, status }));
}

async function apagarLead(env: Env, id: string): Promise<Response> {
  const r = await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
  if (r.meta.changes === 0) return erro("lead não encontrado", 404);
  return semCache(Response.json({ ok: true }));
}

async function rotearLeads(request: Request, env: Env, url: URL, rota: string): Promise<Response> {
  if (rota === "/api/admin/analitica") {
    if (request.method !== "GET") return erro("método não permitido", 405);
    return semCache(await lerAnalitica(env, url));
  }

  if (rota === "/api/admin/leads") {
    return request.method === "GET" ? listarLeads(env, url) : erro("método não permitido", 405);
  }

  if (rota.startsWith(PREFIXO_LEAD)) {
    const id = rota.slice(PREFIXO_LEAD.length);
    if (!UUID.test(id)) return erro("id inválido", 400);
    if (request.method === "PATCH") return mudarStatus(request, env, id);
    if (request.method === "DELETE") return apagarLead(env, id);
    return erro("método não permitido", 405);
  }

  return erro("rota não encontrada", 404);
}

async function rotearApi(request: Request, env: Env, url: URL): Promise<Response> {
  const rota = url.pathname;

  // Captura de lead: intocada, e nenhuma checagem nova antes desta linha. O
  // formulário público não pode regredir por causa do painel.
  if (rota === "/api/lead") return gravarLead(request, env);

  // Contagem de tráfego: pública como a captura, e igualmente antes de
  // qualquer coisa do painel. Ela nunca devolve erro nem toca no que é do
  // painel, então não pode atrapalhar quem está navegando ou reservando.
  if (rota === "/api/e") return receberEventos(request, env, url);

  if (!rota.startsWith("/api/admin/")) return erro("rota não encontrada", 404);

  const chaves = segredos(env);
  if (!chaves) return erro("painel não configurado", 503);

  if (request.method !== "GET" && !mesmaOrigem(request, url)) {
    return erro("origem inválida", 403);
  }

  if (rota === "/api/admin/sessao") {
    if (request.method === "POST") return entrar(request, env, url, chaves);
    if (request.method === "DELETE") {
      return semCache(Response.json({ ok: true }, { headers: { "Set-Cookie": cookieVazio(url) } }));
    }
    if (request.method === "GET") {
      const r = await conferirSessao(chaves.sessao, request.headers.get("Cookie"), url);
      return r === null ? erro("não autorizado", 401) : semCache(Response.json({ ok: true }));
    }
    return erro("método não permitido", 405);
  }

  const restante = await conferirSessao(chaves.sessao, request.headers.get("Cookie"), url);
  if (restante === null) return erro("não autorizado", 401);

  const resposta = await rotearLeads(request, env, url, rota);

  // Sessão deslizante: quem usa o painel toda semana nunca é desconectada.
  if (resposta.status < 400 && precisaRenovar(restante)) {
    resposta.headers.set("Set-Cookie", await emitirCookie(chaves.sessao, url));
  }
  return resposta;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Tudo que não é API é o site: devolve para os assets sem interferir.
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      return await rotearApi(request, env, url);
    } catch {
      // Sem isto, uma exceção devolveria a página de erro da Cloudflare, em
      // inglês e em HTML, para quem esperava JSON.
      return erro("falha inesperada", 500);
    }
  },
};
