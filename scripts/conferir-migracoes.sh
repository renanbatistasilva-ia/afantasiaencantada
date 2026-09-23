#!/usr/bin/env bash
#
# Recusa publicar enquanto houver migração pendente no banco de produção.
#
# Em 23/09/2026 o código novo subiu antes da migração e o painel parou de listar
# pedidos por alguns minutos: a consulta pedia uma coluna que o banco ainda não
# tinha. A ordem certa estava escrita na documentação e ninguém leu — inclusive
# eu, que a escrevi. Documentação não é trava; isto é.
#
# Roda sozinho antes de `npm run deploy`.
#
# Para pular num caso extremo (a API do D1 fora do ar e a publicação urgente):
#   PULAR_CONFERENCIA=1 npm run deploy
set -euo pipefail

if [ "${PULAR_CONFERENCIA:-}" = "1" ]; then
  echo "· conferência de migrações pulada a pedido (PULAR_CONFERENCIA=1)" >&2
  exit 0
fi

echo "· conferindo migrações do banco antes de publicar..." >&2

# A API do D1 já devolveu 7403 de forma transitória; uma tentativa só
# transformaria soluço de rede em deploy bloqueado.
for tentativa in 1 2; do
  if SAIDA="$(npx wrangler d1 migrations list fantasia-leads --remote 2>&1)"; then
    break
  fi
  if [ "$tentativa" = 2 ]; then
    echo >&2
    echo "✗ Não consegui perguntar ao banco quais migrações faltam." >&2
    echo "  Publicar sem saber é o que quebrou o painel em 23/09." >&2
    echo >&2
    echo "$SAIDA" | tail -5 >&2
    echo >&2
    echo "  Tente de novo. Se a API do D1 estiver fora e for urgente:" >&2
    echo "      PULAR_CONFERENCIA=1 npm run deploy" >&2
    exit 1
  fi
  sleep 5
done

if echo "$SAIDA" | grep -q "No migrations to apply"; then
  echo "· banco em dia." >&2
  exit 0
fi

cat >&2 <<FIM

✗ Há migração pendente no banco de produção. NÃO publiquei.

$(echo "$SAIDA" | grep -E "^│ [0-9]" || echo "$SAIDA" | tail -6)

  O código que você está publicando espera colunas ou tabelas que o banco
  ainda não tem. Aplique primeiro:

      npm run db:remoto

  e rode o deploy de novo.
FIM
exit 1
