#!/usr/bin/env bash
# Compõe UMA cena de 1080×1920: um fundo (foto, vídeo ou o roxo da marca) com a fadinha
# recortada por cima. O montar-reel.sh junta as cenas; este faz cada uma.
#
#   compor-cena.sh <fundo> <duracao> <pasta-da-fada|-> <saida.mp4> [opções]
#
#   fundo          foto (.jpg/.png → push-in lento), vídeo (.mp4/.mov → cortado na duração)
#                  ou a palavra `roxo` (degradê ameixa da marca, para gancho, virada e convite)
#   duracao        segundos
#   pasta-da-fada  saída do chave-fadinha.sh (q0001.png… a 24 q/s), ou `-` para sem fadinha
#   saida.mp4      1080×1920, 30 q/s, mudo
#
#   --escala N     fator sobre o quadro de 752×416 dela (1,25 → ela com ~370 px; 1,6 → ~550).
#                  Nunca passe de 1,9: acima de ~670 px ela amolece. Padrão 1,25.
#   --x N --y N    canto superior esquerdo do quadro dela; negativo vale. Padrão 40 · 620.
#                  Como o quadro dela tem 940 px a 1,25×, x=-300 a põe à esquerda da tela.
#   --some         quando a sequência acaba, ela desaparece (eof_action=pass) — é o "sumir em
#                  poeira" do site. Padrão: segura o último quadro até a cena acabar.
#   --passeio      para foto (ou vídeo) HORIZONTAL: em vez de cortar o meio, a câmera passeia
#                  da esquerda para a direita e todo mundo aparece.
#
# Onde pôr a fadinha: nunca em cima de um rosto. Ao lado, sobre bandeirinhas, saia, cerca —
# ela é pequena e voa em volta dos personagens, não na frente deles. Longe da faixa da legenda
# (≈ 1150–1500 px) e dos 250 px do topo.
set -euo pipefail

FUNDO="${1:?fundo}"; DUR="${2:?duração}"; FADA="${3:?pasta da fada ou -}"; SAIDA="${4:?saída.mp4}"
shift 4
ESCALA=1.25; X=40; Y=620; EOF_ACAO=repeat; PASSEIO=0
while [ $# -gt 0 ]; do
  case "$1" in
    --escala) ESCALA="$2"; shift 2 ;;
    --x) X="$2"; shift 2 ;;
    --y) Y="$2"; shift 2 ;;
    --some) EOF_ACAO=pass; shift ;;
    --passeio) PASSEIO=1; shift ;;
    *) echo "opção desconhecida: $1" >&2; exit 1 ;;
  esac
done

ffmpeg() { command ffmpeg -nostdin -hide_banner -loglevel error -y "$@"; }
QUADROS=$(python3 -c "print(int(round($DUR * 30)))")
ROXO="gradients=s=1080x1920:c0=0x251629:c1=0x4b2c50:x0=540:y0=0:x1=540:y1=1920:speed=0.003:r=30"

# ——— o fundo ———
case "$(echo "$FUNDO" | tr '[:upper:]' '[:lower:]')" in
  roxo)
    ENTRADA=(-f lavfi -t "$DUR" -i "$ROXO"); FILTRO_FUNDO="[0:v]null[bg]" ;;
  *.jpg|*.jpeg|*.png|*.webp)
    ENTRADA=(-loop 1 -framerate 30 -t "$DUR" -i "$FUNDO")
    if [ "$PASSEIO" -eq 1 ]; then
      FILTRO_FUNDO="[0:v]scale=-2:1920,crop=1080:1920:x='(iw-1080)*t/$DUR':y=0[bg]"
    else
      # Entra 20 % maior e avança 12 % ao longo da cena, pelo centro. Foto parada num reel
      # parece slide; este movimento é o mínimo que a faz parecer filmada.
      FILTRO_FUNDO="[0:v]scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,zoompan=z='1+0.12*on/$QUADROS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30[bg]"
    fi ;;
  *)
    ENTRADA=(-i "$FUNDO")
    if [ "$PASSEIO" -eq 1 ]; then
      # Vídeo horizontal (uma foto deitada que ganhou movimento): mesmo passeio da foto.
      FILTRO_FUNDO="[0:v]scale=-2:1920,crop=1080:1920:x='(iw-1080)*t/$DUR':y=0,fps=30[bg]"
    else
      FILTRO_FUNDO="[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30[bg]"
    fi ;;
esac

# ——— a fadinha ———
if [ "$FADA" = "-" ]; then
  ffmpeg "${ENTRADA[@]}" -filter_complex "${FILTRO_FUNDO};[bg]format=yuv420p[v]" -map "[v]" \
    -t "$DUR" -r 30 -c:v libx264 -crf 18 -preset fast -an "$SAIDA"
else
  [ -f "$FADA/q0001.png" ] || { echo "não achei $FADA/q0001.png" >&2; exit 1; }
  # 24 q/s é a velocidade dos clipes; outro valor acelera ou arrasta o voo dela.
  ffmpeg "${ENTRADA[@]}" -framerate 24 -i "$FADA/q%04d.png" \
    -filter_complex "${FILTRO_FUNDO};[1:v]format=rgba,scale=iw*${ESCALA}:-2[f];[bg][f]overlay=x=${X}:y=${Y}:eof_action=${EOF_ACAO},format=yuv420p[v]" \
    -map "[v]" -t "$DUR" -r 30 -c:v libx264 -crf 18 -preset fast -an "$SAIDA"
fi
echo "✓ $SAIDA (${DUR}s)"
