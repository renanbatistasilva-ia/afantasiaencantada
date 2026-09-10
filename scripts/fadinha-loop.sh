#!/usr/bin/env bash
# Extrai o loop de "pairar" da fadinha a partir dos vídeos em fundo verde.
#
# Os vídeos ficam em Fadinha/, que é ignorado pelo git — então este script é o
# único registro de como public/images/marca/fadinha/viva.webp nasceu. Refazer
# com um clipe novo é trocar CLIPE/INICIO e rodar.
#
# Por que 3,3667s do clipe 1: medindo a diferença entre quadros vizinhos na
# janela 3,2s–4,4s, o trecho de 10 quadros a partir daí fecha em ciclo com um
# salto de 8,58 — MENOR que a média de 10,90 entre quadros consecutivos. A
# emenda do loop é mais suave que uma troca normal de quadro.
#
# Por que a chave é feita em Python e não no ffmpeg: o filtro `despill` do
# ffmpeg é global e destrói o vestido dela, que é verde. A receita abaixo só
# encosta no EXCESSO de verde sobre o maior entre vermelho e azul, então o
# verde-oliva do vestido sobrevive e as asas translúcidas atravessam sem franja.
set -euo pipefail

CLIPE="${CLIPE:-Fadinha/Videos Fadinha/Fadinha video (1).mp4}"
INICIO="${INICIO:-3.3667}"
QUADROS=10
FPS=12
RECORTE="310:358:220:44"   # largura:altura:x:y — união das caixas dos 10 quadros
TELA_W=160                 # mesma tela das poses estáticas: 160x236
TELA_H=236
CORPO_H=185                # a altura dela dentro da tela, para bater com pose1 (203)
TOPO=29
SAIDA="public/images/marca/fadinha/viva.webp"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ extraindo $QUADROS quadros de $INICIO s"
# `bc` devolve ".843…" sem o zero da frente e o ffmpeg recusa; o printf resolve.
DURACAO="$(printf '%.3f' "$(echo "scale=6; $QUADROS/$FPS + 0.02" | bc -l)")"
ffmpeg -hide_banner -loglevel error -y -ss "$INICIO" -t "$DURACAO" \
  -i "$CLIPE" -vf "fps=$FPS,crop=$RECORTE" "$TMP/cru%02d.png"

echo "→ tirando o verde"
python3 - "$TMP" "$QUADROS" "$TELA_W" "$TELA_H" "$CORPO_H" "$TOPO" <<'PY'
import sys, glob
from PIL import Image
tmp, n, W, H, CH, TOPO = sys.argv[1], int(sys.argv[2]), *map(int, sys.argv[3:7])
# Alfa contínuo: quanto mais o verde domina, mais transparente. Corte seco
# mataria as asas, que são translúcidas e deixam o fundo passar.
DUREZA, SUAVIDADE, RESIDUO = 0.06, 0.28, 0.15
alfa, verde = {}, {}
for g in range(256):
    for m in range(256):
        a = 1 - ((g - m) / 255.0 - DUREZA) / SUAVIDADE
        alfa[(g, m)] = 0 if a < 0 else 255 if a > 1 else int(a * 255)
        verde[(g, m)] = m + int((g - m) * RESIDUO) if g > m else g
for i, f in enumerate(sorted(glob.glob(f"{tmp}/cru*.png"))[:n]):
    im = Image.open(f).convert("RGB")
    out = Image.new("RGBA", im.size)
    out.putdata([(r, verde[(g, r if r > b else b)], b, alfa[(g, r if r > b else b)])
                 for r, g, b in im.getdata()])
    out = out.resize((W, CH), Image.LANCZOS)
    tela = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tela.paste(out, (0, TOPO), out)
    tela.save(f"{tmp}/f{i:02d}.png")
PY

echo "→ montando o WebP animado"
# Este ffmpeg não tem libwebp; quem monta é o img2webp da libwebp.
img2webp -loop 0 -d "$((1000 / FPS))" -lossy -q 70 -m 6 "$TMP"/f*.png -o "$SAIDA" >/dev/null

printf "✓ %s — %s bytes, %s quadros a %s q/s\n" "$SAIDA" "$(stat -f%z "$SAIDA")" "$QUADROS" "$FPS"
