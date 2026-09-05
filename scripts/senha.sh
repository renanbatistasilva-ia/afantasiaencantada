#!/usr/bin/env bash
#
# Troca a senha do painel de leads.
#
# A senha digitada não aparece na tela, não entra no histórico do shell e não é
# passada como argumento — argumento apareceria na lista de processos, visível
# para qualquer outro programa da máquina. O hash também não encosta no disco:
# vai direto para o `wrangler secret put` por um cano.
#
# Uso:  npm run senha
#
# Também aceita a senha pela entrada padrão, para quem tira de um gerenciador:
#       algum-comando-que-imprime-a-senha | npm run senha

set -euo pipefail

# Se o script for interrompido no meio da digitação, o terminal ficaria mudo.
restaurar() { [ -t 0 ] && stty echo 2>/dev/null || true; }
trap restaurar EXIT INT TERM

# Digitar é o caminho normal; cano é para quem já guarda a senha em algum lugar.
INTERATIVO=false
[ -t 0 ] && INTERATIVO=true

perguntar() {
  if [ "$INTERATIVO" = true ]; then
    printf '%s' "$1" >&2
    stty -echo
    IFS= read -r RESPOSTA
    stty echo
    printf '\n' >&2
  else
    IFS= read -r RESPOSTA
  fi
}

perguntar 'Nova senha do painel: '
SENHA="$RESPOSTA"

if [ ${#SENHA} -lt 8 ]; then
  echo "A senha precisa ter pelo menos 8 caracteres. Nada foi alterado." >&2
  exit 1
fi

# Perguntar duas vezes não é burocracia: um erro de digitação aqui é gravado em
# silêncio, e só se descobre na hora de entrar — do lado de fora. Quem manda a
# senha por um cano não digitou, então não há engano de digitação a pegar.
if [ "$INTERATIVO" = true ]; then
  perguntar 'Repita para conferir:   '
  if [ "$SENHA" != "$RESPOSTA" ]; then
    echo "As duas não conferem. Nada foi alterado." >&2
    exit 1
  fi
fi
unset RESPOSTA

echo "Derivando o hash e enviando para a Cloudflare..." >&2

# O normalize("NFC") é o mesmo cuidado que worker/sessao.ts toma ao conferir:
# uma senha com acento digitada no iPhone e gerada no macOS são sequências de
# bytes diferentes se os dois lados não normalizarem igual.
FE_SENHA="$SENHA" node -e '
  const { pbkdf2Sync, randomBytes } = require("crypto");
  const iteracoes = 100000;
  const sal = randomBytes(16);
  const dk = pbkdf2Sync(process.env.FE_SENHA.normalize("NFC"), sal, iteracoes, 32, "sha256");
  process.stdout.write(`pbkdf2$${iteracoes}$${sal.toString("base64url")}$${dk.toString("base64url")}`);
' | npx wrangler secret put PAINEL_SENHA_HASH

unset SENHA FE_SENHA

cat >&2 <<'FIM'

Pronto. A senha antiga não vale mais.

Quem já estava logado continua logado — o cookie de sessão é assinado com outro
segredo e não depende da senha. Para derrubar as sessões também (celular perdido,
por exemplo), rode: npm run sessoes:encerrar
FIM
