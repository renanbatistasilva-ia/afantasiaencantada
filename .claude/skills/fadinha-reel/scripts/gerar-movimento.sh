#!/usr/bin/env bash
# Dá movimento de foto viva a uma foto do elenco (image-to-video) — o modo C do reel.
#
#   gerar-movimento.sh <foto> <saida.mp4> [--prompt "texto" | --prompt-arquivo f]
#                      [--duracao 5] [--modo pro|standard] [--modelo kling3_0]
#
# Dois caminhos, nesta ordem:
#   1. CLI da Higgsfield, se estiver instalada e logada (`npm i -g @higgsfield/cli` e
#      `higgsfield auth login` — uma vez, no terminal do usuário; sem chave).
#   2. fal.ai, se houver FAL_KEY em .env.local na raiz do projeto (Kling v3).
#
# Sem prompt, usa o prompt-base de foto viva de references/marca.md: pose mantida, respiração,
# um piscar, tecido na brisa, câmera parada. É de propósito que ele proíbe sorriso, aceno e
# fala — é o que faz o modelo redesenhar o rosto.
set -euo pipefail

FOTO="${1:?foto de origem}"; SAIDA="${2:?saída .mp4}"; shift 2
DUR=5; MODO=pro; MODELO=kling3_0
PROMPT="Subtle live-photo motion only. The people keep exactly this pose and expression: natural breathing, one slow blink, hair and fabric moving in a light breeze, background elements swaying gently, warm light flicker. Camera completely static. Do not change faces, teeth, hands, clothes or costumes. Nobody talks, walks or turns."
while [ $# -gt 0 ]; do
  case "$1" in
    --prompt) PROMPT="$2"; shift 2 ;;
    --prompt-arquivo) PROMPT="$(cat "$2")"; shift 2 ;;
    --duracao) DUR="$2"; shift 2 ;;
    --modo) MODO="$2"; shift 2 ;;
    --modelo) MODELO="$2"; shift 2 ;;
    *) echo "opção desconhecida: $1" >&2; exit 1 ;;
  esac
done
[ -f "$FOTO" ] || { echo "não achei $FOTO" >&2; exit 1; }

RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
if [ -f "$RAIZ/.env.local" ]; then set -a; . "$RAIZ/.env.local"; set +a; fi
mkdir -p "$(dirname "$SAIDA")"

# A CLI pode estar instalada dentro do projeto (Fadinha/bin/hf, fora do git) — foi o jeito de
# contornar uma rede que intercepta o github.com e derruba o `npm i -g`. Ela vem antes do PATH.
[ -x "$RAIZ/Fadinha/bin/hf" ] && PATH="$RAIZ/Fadinha/bin:$PATH"
higgsfield() { if command -v hf >/dev/null 2>&1; then hf "$@"; else command higgsfield "$@"; fi; }

# Acha a URL do vídeo em qualquer JSON (ou texto) que a ferramenta devolver. As CLIs mudam o
# nome do campo entre versões; procurar "uma URL de .mp4" é mais estável que decorar a chave.
acha_url() {
  python3 -c '
import json, re, sys
bruto = sys.stdin.read()
def urls(o):
    if isinstance(o, dict):
        for v in o.values(): yield from urls(v)
    elif isinstance(o, list):
        for v in o: yield from urls(v)
    elif isinstance(o, str) and o.startswith("http"): yield o
achadas = []
try:
    achadas = list(urls(json.loads(bruto)))
except Exception:
    pass
achadas += re.findall(r"https?://[^\s\"\x27]+", bruto)
for u in achadas:
    if ".mp4" in u or "video" in u.lower():
        print(u); break
'
}

baixa() { curl -sfL "$1" -o "$SAIDA" && echo "✓ $SAIDA"; }

# ——— 1. Higgsfield (conta do usuário, sem chave) ———
if command -v hf >/dev/null 2>&1 || command -v higgsfield >/dev/null 2>&1; then
  echo "→ Higgsfield · $MODELO · $MODO · ${DUR}s · $(basename "$FOTO")"
  if ! BRUTO="$(higgsfield generate create "$MODELO" --prompt "$PROMPT" --start-image "$FOTO" \
        --duration "$DUR" --mode "$MODO" --sound off --wait --json 2>&1)"; then
    echo "$BRUTO" | tail -5 >&2
    echo "A Higgsfield recusou. Se for login: rode \`higgsfield auth login\` no seu terminal." >&2
    exit 1
  fi
  URL="$(echo "$BRUTO" | acha_url)"
  [ -n "$URL" ] || { echo "não achei a URL do vídeo na resposta:" >&2; echo "$BRUTO" | tail -20 >&2; exit 1; }
  baixa "$URL"; exit 0
fi

# ——— 2. fal.ai (chave em .env.local) ———
if [ -n "${FAL_KEY:-}" ]; then
  echo "→ fal.ai · kling v3 $MODO · ${DUR}s · $(basename "$FOTO")"
  case "$(echo "$FOTO" | tr '[:upper:]' '[:lower:]')" in *.png) MIME=image/png ;; *.webp) MIME=image/webp ;; *) MIME=image/jpeg ;; esac
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  python3 - "$FOTO" "$MIME" "$PROMPT" "$DUR" > "$TMP/req.json" <<'PY'
import base64, json, sys
foto, mime, prompt, dur = sys.argv[1:5]
dados = base64.b64encode(open(foto, "rb").read()).decode()
print(json.dumps({
    "start_image_url": f"data:{mime};base64,{dados}",
    "prompt": prompt,
    "duration": str(dur),
    "generate_audio": False,
    "negative_prompt": "blur, distort, low quality, face change, extra fingers, talking, walking",
    "cfg_scale": 0.5,
}))
PY
  ENVIO="https://queue.fal.run/fal-ai/kling-video/v3/$MODO/image-to-video"
  # A documentação oscila entre "Key" e "Bearer" no cabeçalho; tento os dois.
  for AUTH in "Key $FAL_KEY" "Bearer $FAL_KEY"; do
    RESP="$(curl -s -w '\n%{http_code}' -X POST "$ENVIO" -H "Authorization: $AUTH" -H "Content-Type: application/json" --data-binary @"$TMP/req.json")"
    CODIGO="${RESP##*$'\n'}"; CORPO="${RESP%$'\n'*}"
    [ "$CODIGO" = "401" ] || [ "$CODIGO" = "403" ] || break
  done
  [ "$CODIGO" = "200" ] || { echo "fal.ai respondeu $CODIGO: $CORPO" >&2; exit 1; }
  STATUS_URL="$(echo "$CORPO" | python3 -c 'import json,sys; print(json.load(sys.stdin)["status_url"])')"
  RESULT_URL="$(echo "$CORPO" | python3 -c 'import json,sys; print(json.load(sys.stdin)["response_url"])')"
  for _ in $(seq 1 120); do
    ESTADO="$(curl -s "$STATUS_URL" -H "Authorization: $AUTH" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status",""))')"
    case "$ESTADO" in
      COMPLETED) break ;;
      FAILED|ERROR) echo "a geração falhou na fal.ai" >&2; exit 1 ;;
    esac
    sleep 5
  done
  URL="$(curl -s "$RESULT_URL" -H "Authorization: $AUTH" | acha_url)"
  [ -n "$URL" ] || { echo "resultado sem URL de vídeo" >&2; exit 1; }
  baixa "$URL"; exit 0
fi

cat >&2 <<'EOF'
Nenhum gerador disponível. Escolha um:

  Higgsfield (sem chave — usa sua conta), no seu terminal:
    npm i -g @higgsfield/cli
    higgsfield auth login

  ou fal.ai (chave), em .env.local na raiz do projeto:
    FAL_KEY=...
EOF
exit 2
