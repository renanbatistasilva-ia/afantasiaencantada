#!/usr/bin/env bash
# A voz da fadinha e os efeitos sonoros, pela API da ElevenLabs.
#
#   gerar-voz.sh falar  "<texto>"     <saida.mp3> [--voz ID] [--modelo eleven_multilingual_v2]
#   gerar-voz.sh efeito "<descrição>" <saida.mp3> [--segundos 2]
#   gerar-voz.sh vozes  [filtro]        lista id · nome · rótulos (para escolher a voz uma vez)
#
# Chave: ELEVENLABS_API_KEY em .env.local na raiz do projeto (o arquivo é ignorado pelo git).
# Voz padrão: a linha `voice_id:` de references/voz.md — a fadinha tem uma voz só, para sempre.
set -euo pipefail

ACAO="${1:?falar | efeito | vozes}"; shift
RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$RAIZ/.env.local" ]; then set -a; . "$RAIZ/.env.local"; set +a; fi
[ -n "${ELEVENLABS_API_KEY:-}" ] || {
  echo "falta ELEVENLABS_API_KEY em $RAIZ/.env.local (crie a chave em elevenlabs.io → perfil → API keys)" >&2; exit 2; }
API="https://api.elevenlabs.io/v1"

# A voz da fadinha, gravada em voz.md: `voice_id:   xxxx`. Vazio ou "(vazio…" = ainda não escolhida.
voz_da_fadinha() {
  sed -nE 's/^voice_id:[[:space:]]*([A-Za-z0-9]+).*$/\1/p' "$SKILL/references/voz.md" | head -1
}

case "$ACAO" in
  vozes)
    FILTRO="${1:-}"
    curl -sf "$API/voices" -H "xi-api-key: $ELEVENLABS_API_KEY" | python3 -c '
import json, sys
filtro = sys.argv[1].lower()
for v in json.load(sys.stdin)["voices"]:
    r = v.get("labels") or {}
    linha = f"{v['"'"'voice_id'"'"']}  {v['"'"'name'"'"']:<22} {r.get('"'"'language'"'"','"'"''"'"')} {r.get('"'"'accent'"'"','"'"''"'"')} · {r.get('"'"'gender'"'"','"'"''"'"')} · {r.get('"'"'age'"'"','"'"''"'"')} · {r.get('"'"'description'"'"','"'"''"'"')} · {r.get('"'"'use_case'"'"','"'"''"'"')}"
    if filtro in linha.lower(): print(linha)
' "$FILTRO" ;;

  falar)
    TEXTO="${1:?texto}"; SAIDA="${2:?saída .mp3}"; shift 2
    VOZ="$(voz_da_fadinha || true)"; MODELO="eleven_multilingual_v2"
    while [ $# -gt 0 ]; do
      case "$1" in --voz) VOZ="$2"; shift 2 ;; --modelo) MODELO="$2"; shift 2 ;; *) echo "opção desconhecida: $1" >&2; exit 1 ;; esac
    done
    [ -n "$VOZ" ] || { echo "sem voz: escolha uma com \`gerar-voz.sh vozes\` e anote em references/voz.md, ou passe --voz ID" >&2; exit 2; }
    mkdir -p "$(dirname "$SAIDA")"
    # Ajustes de voz.md: estável (ela sussurra, não interpreta), fiel, quase sem dramatização.
    CORPO="$(python3 -c 'import json,sys; print(json.dumps({"text": sys.argv[1], "model_id": sys.argv[2], "voice_settings": {"stability": 0.65, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": False}}))' "$TEXTO" "$MODELO")"
    CODIGO="$(curl -s -w '%{http_code}' -o "$SAIDA" -X POST "$API/text-to-speech/$VOZ?output_format=mp3_44100_128" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" --data-binary "$CORPO")"
    [ "$CODIGO" = "200" ] || { echo "ElevenLabs respondeu $CODIGO:" >&2; head -c 400 "$SAIDA" >&2; echo >&2; rm -f "$SAIDA"; exit 1; }
    printf "✓ %s — %.1fs\n" "$SAIDA" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SAIDA")" ;;

  efeito)
    TEXTO="${1:?descrição do som}"; SAIDA="${2:?saída .mp3}"; shift 2
    SEG=2
    while [ $# -gt 0 ]; do case "$1" in --segundos) SEG="$2"; shift 2 ;; *) echo "opção desconhecida: $1" >&2; exit 1 ;; esac; done
    mkdir -p "$(dirname "$SAIDA")"
    CORPO="$(python3 -c 'import json,sys; print(json.dumps({"text": sys.argv[1], "duration_seconds": float(sys.argv[2]), "prompt_influence": 0.4}))' "$TEXTO" "$SEG")"
    CODIGO="$(curl -s -w '%{http_code}' -o "$SAIDA" -X POST "$API/sound-generation?output_format=mp3_44100_128" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" --data-binary "$CORPO")"
    [ "$CODIGO" = "200" ] || { echo "ElevenLabs respondeu $CODIGO:" >&2; head -c 400 "$SAIDA" >&2; echo >&2; rm -f "$SAIDA"; exit 1; }
    echo "✓ $SAIDA" ;;

  *) echo "ação desconhecida: $ACAO (falar | efeito | vozes)" >&2; exit 1 ;;
esac
