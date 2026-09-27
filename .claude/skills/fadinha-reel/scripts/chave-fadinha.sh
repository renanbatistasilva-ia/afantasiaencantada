#!/usr/bin/env bash
# Recorta a fadinha dos vídeos em fundo verde NA RESOLUÇÃO ORIGINAL (752×416), para
# compor em vídeo. É a mesma chave de scripts/fadinha-loop.sh — que serve ao site e
# reduz tudo a 160×236 — só que sem reduzir, sem recortar e com o quadro inteiro, para
# a posição dela dentro do plano ser preservada.
#
#   chave-fadinha.sh <clipe> <inicio> <duracao> <pasta-saida> [--mov]
#
#   clipe        1 a 4  →  Fadinha/Videos Fadinha/Fadinha video (N).mp4
#   inicio       segundos
#   duracao      segundos
#   pasta-saida  recebe q0001.png … (RGBA)
#   --mov        também gera fadinha.mov (ProRes 4444 com alfa) para CapCut/Resolve
#
# Janelas boas de cada clipe: references/fadinha-clipes.md.
set -euo pipefail

N="${1:?clipe (1-4)}"
INICIO="${2:?início em segundos}"
DURACAO="${3:?duração em segundos}"
SAIDA="${4:?pasta de saída}"
MOV=0; [ "${5:-}" = "--mov" ] && MOV=1

# A raiz do projeto é quatro níveis acima deste script (.claude/skills/fadinha-reel/scripts).
RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
CLIPE="$RAIZ/Fadinha/Videos Fadinha/Fadinha video ($N).mp4"
[ -f "$CLIPE" ] || { echo "não achei $CLIPE" >&2; exit 1; }

mkdir -p "$SAIDA"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# A velocidade é a do arquivo: acelerar a fadinha muda o jeito de ela voar.
FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$CLIPE")"

echo "→ clipe $N, ${INICIO}s por ${DURACAO}s, ${FPS} q/s"
ffmpeg -hide_banner -loglevel error -y -ss "$INICIO" -t "$DURACAO" -i "$CLIPE" "$TMP/cru%04d.png"

python3 - "$TMP" "$SAIDA" <<'PY'
import sys, glob, os
from PIL import Image, ImageChops
tmp, saida = sys.argv[1], sys.argv[2]

# Alfa contínuo: quanto mais o verde domina o maior entre vermelho e azul, mais
# transparente. Corte seco mataria as asas, que são translúcidas. O despill só
# encosta no EXCESSO de verde — o `despill` do ffmpeg é global e apaga o vestido
# verde-oliva dela. Mesmos números de scripts/fadinha-loop.sh; aqui em operações de
# canal inteiras (C), porque no quadro inteiro o laço por pixel demoraria minutos.
DUREZA, SUAVIDADE, RESIDUO = 0.06, 0.28, 0.15
lut_alfa = []
for d in range(256):
    a = 1 - (d / 255.0 - DUREZA) / SUAVIDADE
    lut_alfa.append(0 if a < 0 else 255 if a > 1 else int(a * 255))
lut_sobra = [int(d * (1 - RESIDUO)) for d in range(256)]   # o que sai do verde

alturas = []
for i, f in enumerate(sorted(glob.glob(f"{tmp}/cru*.png")), 1):
    r, g, b = Image.open(f).convert("RGB").split()
    m = ImageChops.lighter(r, b)                 # max(r, b)
    d = ImageChops.subtract(g, m)                # g − m, zerado onde g ≤ m
    alfa = d.point(lut_alfa)
    g2 = ImageChops.subtract(g, d.point(lut_sobra))   # g − 0,85·(g − m)  →  m + 0,15·(g − m)
    out = Image.merge("RGBA", (r, g2, b, alfa))
    out.save(os.path.join(saida, f"q{i:04d}.png"))
    caixa = alfa.point(lambda v: 255 if v > 25 else 0).getbbox()
    if caixa:
        alturas.append(caixa[3] - caixa[1])

n = len(alturas)
print(f"  {n} quadros · altura dela: máx {max(alturas)}px, mín {min(alturas)}px "
      f"(escale por ALTURA: scale=-2:ALVO, e ALVO ≤ 670 num quadro de 1920)")
PY

if [ "$MOV" -eq 1 ]; then
  ffmpeg -hide_banner -loglevel error -y -framerate "$FPS" -i "$SAIDA/q%04d.png" \
    -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le "$SAIDA/fadinha.mov"
  echo "  ✓ $SAIDA/fadinha.mov (ProRes 4444 com alfa)"
fi
echo "✓ $SAIDA"
