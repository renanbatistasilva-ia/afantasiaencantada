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

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Rota temporária de fundação: prova que o roteamento chega ao Worker.
    // Sai quando o primeiro endpoint de verdade entrar no lugar.
    if (url.pathname === "/api/ping") {
      return Response.json({ ok: true, agora: new Date().toISOString() });
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ erro: "rota não encontrada" }, { status: 404 });
    }

    // Tudo mais é o site: devolve para a camada de assets sem interferir.
    return env.ASSETS.fetch(request);
  },
};
