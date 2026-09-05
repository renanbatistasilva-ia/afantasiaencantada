#!/usr/bin/env bash
#
# Desconecta o painel em todos os aparelhos, de uma vez.
#
# O cookie de sessão é assinado com PAINEL_SESSAO_SEGREDO e não guarda estado no
# servidor — não existe lista de sessões para revogar uma por uma. Trocar o
# segredo invalida todas as assinaturas já emitidas, e é por isso que este script
# existe com nome óbvio: ninguém adivinharia que rotacionar um segredo é o que
# desconecta um celular perdido.
#
# A senha NÃO muda. Quem souber a senha entra de novo logo em seguida — se o
# problema for a senha ter vazado, rode `npm run senha` antes deste.
#
# Uso:  npm run sessoes:encerrar

set -euo pipefail

openssl rand -base64 32 | npx wrangler secret put PAINEL_SESSAO_SEGREDO

cat >&2 <<'FIM'

Pronto. Todos os aparelhos foram desconectados do painel.

Na próxima vez que alguém abrir /admin, a senha será pedida de novo.
FIM
