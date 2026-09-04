/**
 * Segredos e bindings que não vivem no wrangler.jsonc.
 *
 * `wrangler types` gera o Env a partir do wrangler.jsonc, mas segredo não fica
 * lá — fica no `wrangler secret put` (produção) e no .dev.vars (local). Sem esta
 * declaração o TypeScript não conheceria os dois nomes abaixo.
 *
 * Só os NOMES moram aqui. Nenhum valor.
 */
interface Env {
  /** PBKDF2 da senha do painel: `pbkdf2$<iterações>$<sal>$<derivada>`. */
  PAINEL_SENHA_HASH: string;
  /** 32 bytes aleatórios em base64, usados só para assinar o cookie de sessão. */
  PAINEL_SESSAO_SEGREDO: string;
}
