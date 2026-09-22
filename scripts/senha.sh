#!/usr/bin/env bash
#
# Troca a senha do painel de leads — e confere que ela entra, antes de dizer que terminou.
#
# A senha digitada não aparece na tela, não entra no histórico do shell e não é
# passada como argumento — argumento apareceria na lista de processos, visível
# para qualquer outro programa da máquina. O hash também não encosta no disco:
# vai direto para o `wrangler secret put` por um cano.
#
# Uso:  npm run senha              troca a senha
#       npm run senha:conferir     só testa uma senha, sem trocar nada
#
# Também aceita a senha pela entrada padrão, para quem tira de um gerenciador:
#       algum-comando-que-imprime-a-senha | npm run senha

set -euo pipefail

PAINEL="https://afantasiaencantada.com"

CONFERIR_APENAS=false
[ "${1:-}" = "--conferir" ] && CONFERIR_APENAS=true

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

# O Worker apara a senha recebida antes de conferir (worker/index.ts, `senha.trim()`),
# porque teclado de celular põe espaço com facilidade. Este script precisa aparar ANTES de
# derivar o hash, senão os dois lados calculam sobre textos diferentes: o hash guardado
# seria o da senha COM espaço e a conferência testaria sempre a versão SEM — e aí não existe
# nada que a dona possa digitar que entre, nem a senha com o espaço. Foi o que trancou o
# painel dela. Em bash puro, para a senha não virar argumento de um `sed` nem de nada.
aparar() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

# Pergunta ao painel de verdade se a senha entra. É a única prova que vale: derivar o hash
# certo não garante que o segredo chegou, e conferir localmente não testaria o Worker.
#
# `mesmaOrigem` e `ehJson` (worker/index.ts) recusam antes de olhar a senha, então o Origin e
# o Content-Type são obrigatórios. O corpo vai por cano para a senha não aparecer no `ps`.
conferir_no_painel() {
  FE_SENHA="$1" node -e 'process.stdout.write(JSON.stringify({ senha: process.env.FE_SENHA }))' \
    | curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
        -X POST "$PAINEL/api/admin/sessao" \
        -H 'Content-Type: application/json' \
        -H "Origin: $PAINEL" \
        --data-binary @- || echo "000"
}

perguntar "$([ "$CONFERIR_APENAS" = true ] && echo 'Senha a conferir: ' || echo 'Nova senha do painel: ')"
SENHA="$(aparar "$RESPOSTA")"

# ——— modo de só conferir: não troca nada ———
if [ "$CONFERIR_APENAS" = true ]; then
  [ -n "$SENHA" ] || { echo "Nenhuma senha digitada." >&2; exit 1; }
  echo "Perguntando ao painel..." >&2
  CODIGO="$(conferir_no_painel "$SENHA")"
  unset SENHA RESPOSTA
  case "$CODIGO" in
    200) echo "✓ esta senha entra no painel." >&2; exit 0 ;;
    401) echo "✗ esta senha NÃO entra. Para definir outra: npm run senha" >&2; exit 1 ;;
    429) echo "· o painel está freando as tentativas. Espere um minuto e repita." >&2; exit 1 ;;
    000) echo "· não consegui falar com $PAINEL. Sem rede?" >&2; exit 1 ;;
    *)   echo "· o painel respondeu $CODIGO — inesperado." >&2; exit 1 ;;
  esac
fi

# ——— troca ———
if [ ${#SENHA} -lt 8 ]; then
  echo "A senha precisa ter pelo menos 8 caracteres. Nada foi alterado." >&2
  exit 1
fi

# Perguntar duas vezes não é burocracia: um erro de digitação aqui é gravado em
# silêncio, e só se descobre na hora de entrar — do lado de fora. Quem manda a
# senha por um cano não digitou, então não há engano de digitação a pegar.
if [ "$INTERATIVO" = true ]; then
  perguntar 'Repita para conferir:   '
  # Comparar já aparado: as duas são a mesma senha se diferem só por espaço na ponta,
  # que é exatamente o que o painel vai ignorar.
  if [ "$SENHA" != "$(aparar "$RESPOSTA")" ]; then
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

# ——— a prova ———
#
# O segredo novo leva de segundos a minutos para valer em todo lado, então insistir faz parte.
# As esperas são largas de propósito: o painel freia em 5 tentativas por minuto por IP, e
# tentativas apertadas gastariam o freio com o próprio teste.
echo >&2
echo "Conferindo se a senha nova já entra..." >&2
ENTROU=false
for ESPERA in 3 12 25 40 60; do
  sleep "$ESPERA"
  CODIGO="$(conferir_no_painel "$SENHA")"
  case "$CODIGO" in
    200) ENTROU=true; break ;;
    429) printf '  (freio de tentativas; esperando)\n' >&2 ;;
    000) printf '  (sem resposta de %s)\n' "$PAINEL" >&2 ;;
    *)   printf '  (ainda não — o segredo leva um tempo para propagar)\n' >&2 ;;
  esac
done
unset SENHA FE_SENHA

if [ "$ENTROU" = true ]; then
  cat >&2 <<'FIM'

✓ Senha trocada e CONFERIDA: ela entra em afantasiaencantada.com/admin.

Quem já estava logado continua logado — o cookie de sessão é assinado com outro
segredo e não depende da senha. Para derrubar as sessões também (celular perdido,
por exemplo), rode: npm run sessoes:encerrar
FIM
else
  cat >&2 <<'FIM'

⚠ O hash foi enviado, mas a senha nova ainda NÃO entrou no painel nas tentativas feitas.

Quase sempre é só propagação demorando. Espere um minuto e confirme com:

    npm run senha:conferir

Se continuar não entrando, rode `npm run senha` de novo — e não entregue a senha
a ninguém antes de ver o "✓ conferida".
FIM
  exit 1
fi
