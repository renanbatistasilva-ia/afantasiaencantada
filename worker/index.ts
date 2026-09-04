/**
 * Worker da Fantasia Encantada.
 *
 * O site continua sendo servido como arquivos estáticos pela camada de assets
 * do Cloudflare — este Worker só é invocado nas rotas declaradas em
 * `run_worker_first` no wrangler.jsonc (hoje, `/api/*`).
 *
 * Qualquer outra coisa que chegue aqui é repassada para os assets, para o site
 * nunca depender deste código para funcionar.
 */

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") {
      return gravarLead(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ erro: "rota não encontrada" }, { status: 404 });
    }

    // Tudo mais é o site: devolve para a camada de assets sem interferir.
    return env.ASSETS.fetch(request);
  },
};
