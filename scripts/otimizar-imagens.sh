#!/usr/bin/env bash
#
# Converte as fotos de public/images/ para WebP e atualiza as referências no código.
#
# Por que à mão: o Next desliga a otimização de imagem quando o site é exportado
# como estático (`output: "export"`), que é como este aqui é publicado. Sem isto,
# os JPEG vão crus para o visitante.
#
# Roda quantas vezes quiser. O que já é WebP é ignorado, e uma conversão que
# ficar MAIOR que o original é descartada — acontece com imagem pequena ou de
# poucas cores, e trocar para pior não é otimizar.
#
#   scripts/otimizar-imagens.sh            converte e atualiza o código
#   scripts/otimizar-imagens.sh --simular  só mostra o que faria
#
# Qualidade: 85 para foto, 90 para PNG com transparência. Medido contra o
# original na foto mais pesada do site (moana-vela): erro médio de 1,76 por
# pixel em 255, abaixo do que o olho distingue. Acima de 92 o arquivo fica
# MAIOR que o JPEG e não se ganha nada.
set -euo pipefail

SIMULAR=false
[ "${1:-}" = "--simular" ] && SIMULAR=true

cd "$(dirname "$0")/.."
command -v cwebp >/dev/null || { echo "falta o cwebp (brew install webp)" >&2; exit 1; }

# A fadinha já é WebP animado, feito pelo fadinha-loop.sh — não mexer.
# O og-v2.jpg fica fora porque mora na raiz de public/, e é de propósito: o
# cartão que aparece no WhatsApp e no Instagram precisa ser JPEG ou PNG, que é
# o que todo robô de rede social sabe ler.
ANTES=0; DEPOIS=0; N=0; PULADOS=0

while IFS= read -r origem; do
  case "$origem" in *"/marca/fadinha/"*) continue ;; esac
  destino="${origem%.*}.webp"
  [ -f "$destino" ] && continue

  case "$(echo "$origem" | tr '[:upper:]' '[:lower:]')" in
    *.png) Q=90 ;;
    *)     Q=85 ;;
  esac

  tmp="$(mktemp -t webp).webp"
  cwebp -q "$Q" -m 6 -quiet "$origem" -o "$tmp"

  tam_antes=$(stat -f%z "$origem")
  tam_depois=$(stat -f%z "$tmp")

  if [ "$tam_depois" -ge "$tam_antes" ]; then
    rm -f "$tmp"
    PULADOS=$((PULADOS + 1))
    printf "  = %-46s %5s KB  (WebP ficaria maior; mantido)\n" "${origem#public/images/}" "$((tam_antes / 1024))"
    continue
  fi

  ANTES=$((ANTES + tam_antes)); DEPOIS=$((DEPOIS + tam_depois)); N=$((N + 1))
  printf "  ↓ %-46s %5s → %4s KB  (−%s%%)\n" "${origem#public/images/}" \
    "$((tam_antes / 1024))" "$((tam_depois / 1024))" "$(((tam_antes - tam_depois) * 100 / tam_antes))"

  if [ "$SIMULAR" = false ]; then
    mv "$tmp" "$destino"
    rm -f "$origem"
    # O caminho aparece em src/data/*.ts e em .tsx com foto fixa. Trocar a
    # extensão em todos de uma vez evita imagem quebrada em produção — que é
    # o único jeito de descobrir que faltou uma.
    velho="${origem#public}"
    grep -rl --include="*.ts" --include="*.tsx" -F "$velho" src/ 2>/dev/null \
      | xargs -I{} sed -i '' "s|${velho}|${velho%.*}.webp|g" {} 2>/dev/null || true
  else
    rm -f "$tmp"
  fi
done < <(find public/images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | sort)

echo
if [ "$N" -eq 0 ]; then
  echo "  nada a converter — tudo já está em WebP."
else
  printf "  %s imagens: %s KB → %s KB  (−%s KB, −%s%%)\n" "$N" \
    "$((ANTES / 1024))" "$((DEPOIS / 1024))" "$(((ANTES - DEPOIS) / 1024))" \
    "$(((ANTES - DEPOIS) * 100 / ANTES))"
fi
[ "$PULADOS" -gt 0 ] && echo "  $PULADOS mantidas no formato original."
[ "$SIMULAR" = true ] && echo && echo "  (simulação: nada foi alterado)"
exit 0
