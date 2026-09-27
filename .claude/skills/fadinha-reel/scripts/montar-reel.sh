#!/usr/bin/env bash
# Monta o reel: cenas → legendas → voz e música → reel.mp4 (1080×1920, 30 fps, H.264).
#
#   montar-reel.sh <pasta-do-reel>
#
# Na pasta:
#   montagem.txt   obrigatório · `arquivo|duracao` por linha, na ordem. Imagem ganha um
#                  push-in lento (12 % ao longo da duração); vídeo é cortado na duração.
#                  Caminhos relativos à pasta do reel, ou absolutos. # comenta.
#   legendas.txt   opcional · `inicio|fim|texto` em segundos
#   voz.txt        opcional · `arquivo|inicio` — uma fala por linha
#   musica.mp3     opcional · entra a −14 dB sob a voz
#
# Sai reel.mp4. As zonas de segurança do Instagram (250 px no topo, 420 px embaixo) já
# estão no legendas.py. Sem drawtext neste ffmpeg, a legenda é PNG sobreposta.
set -euo pipefail

# -nostdin sempre: chamado dentro de um `while read`, o ffmpeg lê o stdin para comandos
# interativos e engole as linhas seguintes do montagem.txt — só a primeira cena entrava.
ffmpeg() { command ffmpeg -nostdin -hide_banner -loglevel error -y "$@"; }

PASTA="${1:?pasta do reel}"
PASTA="$(cd "$PASTA" && pwd)"
AQUI="$(cd "$(dirname "$0")" && pwd)"
[ -f "$PASTA/montagem.txt" ] || { echo "falta $PASTA/montagem.txt" >&2; exit 1; }

TMP="$PASTA/.tmp"; rm -rf "$TMP"; mkdir -p "$TMP/cenas" "$TMP/leg"
absoluto() { case "$1" in /*) echo "$1" ;; *) echo "$PASTA/$1" ;; esac; }

# ——— 1. cada cena vira 1080×1920 a 30 q/s, muda ———
echo "→ cenas"
i=0; : > "$TMP/lista.txt"
while IFS='|' read -r arquivo dur; do
  arquivo="$(echo "$arquivo" | sed 's/^ *//;s/ *$//')"; dur="$(echo "${dur:-}" | tr -d ' ')"
  [ -z "$arquivo" ] && continue; case "$arquivo" in \#*) continue ;; esac
  [ -n "$dur" ] || { echo "cena sem duração: $arquivo" >&2; exit 1; }
  src="$(absoluto "$arquivo")"; [ -f "$src" ] || { echo "não achei $src" >&2; exit 1; }
  i=$((i + 1)); dst="$TMP/cenas/s$(printf %02d $i).mp4"
  case "$(echo "$src" | tr '[:upper:]' '[:lower:]')" in
    *.jpg|*.jpeg|*.png|*.webp)
      # Push-in: a imagem entra 20 % maior que o quadro e o zoompan avança 12 % ao longo
      # da cena, sempre pelo centro. Sem isso, foto parada num reel parece slide.
      quadros=$(python3 -c "print(int(round($dur * 30)))")
      ffmpeg -loop 1 -framerate 30 -t "$dur" -i "$src" \
        -vf "scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,zoompan=z='1+0.12*on/$quadros':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p" \
        -t "$dur" -r 30 -c:v libx264 -crf 18 -preset fast -an "$dst" ;;
    *)
      ffmpeg -i "$src" -t "$dur" \
        -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p" \
        -r 30 -c:v libx264 -crf 18 -preset fast -an "$dst" ;;
  esac
  echo "file '$dst'" >> "$TMP/lista.txt"
  printf "  %02d  %-6ss  %s\n" "$i" "$dur" "$arquivo"
done < "$PASTA/montagem.txt"
[ "$i" -gt 0 ] || { echo "montagem.txt vazio" >&2; exit 1; }

ffmpeg -f concat -safe 0 -i "$TMP/lista.txt" -c copy "$TMP/video.mp4"
DUR_TOTAL="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/video.mp4")"
VIDEO="$TMP/video.mp4"

# ——— 2. legendas: PNG por fala, sobreposta só no seu intervalo ———
if [ -f "$PASTA/legendas.txt" ]; then
  echo "→ legendas"
  python3 "$AQUI/legendas.py" "$PASTA/legendas.txt" "$TMP/leg" > "$TMP/leg/manifesto.txt"
  entradas=(-i "$VIDEO"); filtro=""; anterior="0:v"; k=0
  while IFS='|' read -r png ini fim; do
    k=$((k + 1)); entradas+=(-i "$png")
    filtro="$filtro[$anterior][$k:v]overlay=0:0:enable='between(t,$ini,$fim)'[v$k];"
    anterior="v$k"
  done < "$TMP/leg/manifesto.txt"
  if [ "$k" -gt 0 ]; then
    filtro="${filtro%;}"
    ffmpeg "${entradas[@]}" -filter_complex "$filtro" -map "[$anterior]" \
      -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -r 30 -an "$TMP/video-leg.mp4"
    VIDEO="$TMP/video-leg.mp4"
    echo "  $k legendas"
  fi
fi

# ——— 3. voz e música sobre uma base de silêncio do tamanho do vídeo ———
echo "→ som"
entradas=(-i "$VIDEO" -f lavfi -t "$DUR_TOTAL" -i "anullsrc=r=48000:cl=stereo")
filtro=""; mix="[1:a]"; n=1; k=1
if [ -f "$PASTA/voz.txt" ]; then
  while IFS='|' read -r arquivo ini; do
    arquivo="$(echo "$arquivo" | sed 's/^ *//;s/ *$//')"; [ -z "$arquivo" ] && continue
    case "$arquivo" in \#*) continue ;; esac
    src="$(absoluto "$arquivo")"; [ -f "$src" ] || { echo "não achei $src" >&2; exit 1; }
    k=$((k + 1)); n=$((n + 1)); entradas+=(-i "$src")
    ms=$(python3 -c "print(int(round(${ini:-0} * 1000)))")
    filtro="$filtro[$k:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=$ms|$ms[a$k];"
    mix="$mix[a$k]"
  done < "$PASTA/voz.txt"
fi
for m in "$PASTA"/musica.*; do
  [ -f "$m" ] || continue
  k=$((k + 1)); n=$((n + 1)); entradas+=(-i "$m")
  filtro="$filtro[$k:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=-14dB[a$k];"
  mix="$mix[a$k]"
  break
done
# normalize=0: a mistura não abaixa a voz só porque a música existe.
filtro="$filtro${mix}amix=inputs=$n:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"

ffmpeg "${entradas[@]}" -filter_complex "$filtro" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  -shortest "$PASTA/reel.mp4"

rm -rf "$TMP"
printf "✓ %s/reel.mp4 — %.1f s, %s\n" "$PASTA" "$DUR_TOTAL" \
  "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$PASTA/reel.mp4" | sed 's/,/×/g')"
