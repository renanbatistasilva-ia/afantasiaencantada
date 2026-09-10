#!/usr/bin/env bash
# Recorta uma cena da fadinha dos vídeos em fundo verde e monta um WebP animado.
#
# Os vídeos ficam em Fadinha/, ignorado pelo git — então este script é o único
# registro de como cada arquivo em public/images/marca/fadinha/ nasceu.
#
#   scripts/fadinha-loop.sh <clipe> <inicio> <duracao> <nome> [--segura MS]
#
#   clipe    1 a 4
#   inicio   segundos
#   duracao  segundos
#   nome     vira public/images/marca/fadinha/<nome>.webp
#   --segura faz o ÚLTIMO quadro durar MS milissegundos, para cenas que crescem
#            e não voltam (o coração de luz). Sem isso o loop dá um solavanco.
#   --vaievem toca o trecho para frente e depois de trás para frente. A emenda
#            fica perfeita por construção, ao custo do dobro de quadros. Serve
#            para quem está sempre à deriva e nunca volta ao ponto de partida:
#            no clipe 3, mesmo o trecho mais estável fechava a 1,52x a variação
#            entre vizinhos, e a virada de orientação se via.
#
# As janelas em uso foram escolhidas medindo o salto entre o último quadro e o
# primeiro contra a variação média entre quadros vizinhos — ver docs/ensaio-fotos.md:
#
#   paira    clipe 1  2,40s  2,5s   salto 4,10  (média 5,41)
#   serena   clipe 4  3,90s  2,5s   salto 3,40  (média 3,53)
#   giro     clipe 3  2,20s  2,5s   salto 6,60  (média 5,16)
#   coracao  clipe 2  4,40s  1,0s   --segura 8000
set -euo pipefail

CLIPE_N="${1:?clipe (1-4)}"
INICIO="${2:?início em segundos}"
DURACAO="${3:?duração em segundos}"
NOME="${4:?nome do arquivo de saída}"
SEGURA=0
PINGUE=0
case "${5:-}" in
  --segura) SEGURA="${6:?ms do último quadro}" ;;
  --vaievem) PINGUE=1 ;;
esac

FPS=12
TELA_W=160          # mesma tela das poses estáticas
TELA_H=236
CORPO_H=185         # altura dela dentro da tela, para bater com pose1 (203)
QUALIDADE=70
CLIPE="Fadinha/Videos Fadinha/Fadinha video ($CLIPE_N).mp4"
SAIDA="public/images/marca/fadinha/$NOME.webp"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

echo "→ $NOME: clipe $CLIPE_N, ${INICIO}s por ${DURACAO}s a $FPS q/s"
ffmpeg -hide_banner -loglevel error -y -ss "$INICIO" -t "$DURACAO" -i "$CLIPE" \
  -vf "fps=$FPS" "$TMP/cru%03d.png"

python3 - "$TMP" "$TELA_W" "$TELA_H" "$CORPO_H" <<'PY'
import sys, glob
from PIL import Image
tmp, W, H, CORPO = sys.argv[1], *map(int, sys.argv[2:5])

# Alfa contínuo: quanto mais o verde domina, mais transparente. Corte seco
# mataria as asas, que são translúcidas e deixam o fundo passar. O despill só
# encosta no EXCESSO de verde sobre o maior entre vermelho e azul — o filtro
# `despill` do ffmpeg é global e apaga o vestido verde-oliva dela.
DUREZA, SUAVIDADE, RESIDUO = 0.06, 0.28, 0.15
alfa, verde = {}, {}
for g in range(256):
    for m in range(256):
        a = 1 - ((g - m) / 255.0 - DUREZA) / SUAVIDADE
        alfa[(g, m)] = 0 if a < 0 else 255 if a > 1 else int(a * 255)
        verde[(g, m)] = m + int((g - m) * RESIDUO) if g > m else g

arquivos = sorted(glob.glob(f"{tmp}/cru*.png"))
chaveados = []
# Um recorte só para todos os quadros: é o movimento DENTRO dele que anima. Se
# cada quadro tivesse o próprio recorte, ela ficaria colada no centro e o voo
# sumiria.
uniao = None
for f in arquivos:
    im = Image.open(f).convert("RGB")
    out = Image.new("RGBA", im.size)
    out.putdata([(r, verde[(g, r if r > b else b)], b, alfa[(g, r if r > b else b)])
                 for r, g, b in im.getdata()])
    chaveados.append(out)
    caixa = out.split()[3].point(lambda v: 255 if v > 25 else 0).getbbox()
    if caixa:
        uniao = caixa if uniao is None else (min(uniao[0], caixa[0]), min(uniao[1], caixa[1]),
                                             max(uniao[2], caixa[2]), max(uniao[3], caixa[3]))

x0, y0, x1, y1 = uniao
larg, alt = x1 - x0, y1 - y0
# A escala vem da ALTURA, nunca da largura. Ajustando pela largura, um clipe
# com as asas abertas ou rastro de faísca encolhia o corpo dela — a `giro` saía
# a 151px contra os 185px da `paira`, e ela mudava de tamanho ao trocar de pose.
# Se a largura estourar a tela, o que sobra são pontas de asa e faísca, e essas
# podem sair pela borda sem prejuízo.
escala = CORPO / alt
nw, nh = round(larg * escala), round(alt * escala)
print(f"  corpo na fonte {larg}x{alt} → {nw}x{nh} na tela de {W}x{H}"
      + (f"  (sobram {nw - W}px de largura, cortados nas pontas)" if nw > W else ""))

for i, out in enumerate(chaveados):
    corte = out.crop((x0, y0, x1, y1)).resize((nw, nh), Image.LANCZOS)
    tela = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tela.paste(corte, ((W - nw) // 2, (H - nh) // 2 + 8), corte)
    tela.save(f"{tmp}/f{i:03d}.png")
PY

# Este ffmpeg não tem libwebp; quem monta o animado é o img2webp.
QUADROS=("$TMP"/f*.png)
if [ "$PINGUE" -eq 1 ]; then
  # Volta sem repetir as pontas, senão elas piscam duas vezes.
  N=${#QUADROS[@]}
  for ((i = N - 2; i >= 1; i--)); do QUADROS+=("${QUADROS[$i]}"); done
fi
ARGS=(-loop 0)
for q in "${QUADROS[@]:0:${#QUADROS[@]}-1}"; do
  ARGS+=(-d "$((1000 / FPS))" -lossy -q "$QUALIDADE" "$q")
done
# O bash 3.2 do macOS não aceita índice negativo.
ULTIMO="${QUADROS[$((${#QUADROS[@]} - 1))]}"
# O último quadro segura quando a cena cresce e não volta.
[ "$SEGURA" -gt 0 ] && ARGS+=(-d "$SEGURA") || ARGS+=(-d "$((1000 / FPS))")
ARGS+=(-lossy -q "$QUALIDADE" "$ULTIMO")

img2webp "${ARGS[@]}" -o "$SAIDA" >/dev/null

printf "✓ %s — %s bytes, %s quadros%s\n" "$SAIDA" "$(stat -f%z "$SAIDA")" "${#QUADROS[@]}" \
  "$([ "$SEGURA" -gt 0 ] && echo ", último segurando ${SEGURA}ms")"
