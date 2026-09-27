#!/usr/bin/env python3
"""Desenha cada legenda num PNG transparente de 1080×1920, para o ffmpeg sobrepor.

Este ffmpeg não tem drawtext nem subtitles (sem libass/freetype), então a legenda é
desenhada aqui, com o PIL, e entra na montagem como imagem.

    legendas.py <legendas.txt> <pasta-saida> [--fonte CAMINHO] [--tamanho 64]

legendas.txt: uma por linha, `inicio|fim|texto` em segundos. Linhas vazias e as que
começam com # são ignoradas. Imprime um manifesto `arquivo|inicio|fim` por legenda, que
o montar-reel.sh lê.

O bloco fica logo acima dos 420px de baixo que a interface do Instagram cobre, e nunca
sobe além dos 250px do topo. Texto branco sobre uma caixa ameixa translúcida: legível em
cena clara ou escura sem depender do fundo.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

L, A = 1080, 1920
SEGURO_TOPO, SEGURO_BASE = 250, 420
LARGURA_MAX = 900
MARGEM = 28            # respiro entre o texto e a borda da caixa
AMEIXA = (37, 22, 41, 200)   # #251629 a ~78 %
BRANCO = (250, 243, 236, 255)  # porcelana

FONTES = [
    "/System/Library/Fonts/Avenir Next.ttc",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
]


def carregar_fonte(caminho, tamanho):
    """Negrito reto, sempre: é o que se lê num celular com o sol batendo na tela.

    Um .ttc guarda várias faces e a ordem muda de arquivo para arquivo — chutar o índice
    já entregou uma itálica leve. Então percorro as faces, leio o nome de cada uma e
    escolho pelo estilo: Bold sem Italic; senão, qualquer reta; senão, a primeira.
    """
    candidatos = [caminho] if caminho else FONTES
    for c in candidatos:
        if not os.path.exists(c):
            continue
        faces = []
        for indice in range(16):
            try:
                f = ImageFont.truetype(c, tamanho, index=indice)
            except (OSError, ValueError, IndexError):
                break
            estilo = f.getname()[1].lower()
            faces.append((f, estilo))
        if not faces:
            continue
        for f, estilo in faces:
            if "bold" in estilo and "italic" not in estilo and "condensed" not in estilo:
                return f
        for f, estilo in faces:
            if "italic" not in estilo:
                return f
        return faces[0][0]
    return ImageFont.load_default()


def quebrar(texto, fonte, largura):
    linhas, atual = [], ""
    for palavra in texto.split():
        tentativa = (atual + " " + palavra).strip()
        if fonte.getlength(tentativa) <= largura or not atual:
            atual = tentativa
        else:
            linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def desenhar(texto, fonte, destino):
    linhas = quebrar(texto, fonte, LARGURA_MAX - 2 * MARGEM)
    alt_linha = int(fonte.size * 1.25)
    alt_bloco = alt_linha * len(linhas) + 2 * MARGEM
    larg_bloco = max(int(fonte.getlength(l)) for l in linhas) + 2 * MARGEM
    x0 = (L - larg_bloco) // 2
    y0 = A - SEGURO_BASE - alt_bloco - 40
    y0 = max(y0, SEGURO_TOPO)

    img = Image.new("RGBA", (L, A), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0, y0, x0 + larg_bloco, y0 + alt_bloco), radius=22, fill=AMEIXA)
    y = y0 + MARGEM
    for l in linhas:
        w = fonte.getlength(l)
        d.text(((L - w) / 2, y), l, font=fonte, fill=BRANCO)
        y += alt_linha
    img.save(destino)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(2)
    entrada, saida = args[0], args[1]
    fonte_caminho, tamanho = None, 64
    if "--fonte" in args:
        fonte_caminho = args[args.index("--fonte") + 1]
    if "--tamanho" in args:
        tamanho = int(args[args.index("--tamanho") + 1])

    os.makedirs(saida, exist_ok=True)
    fonte = carregar_fonte(fonte_caminho, tamanho)
    n = 0
    with open(entrada, encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if not linha or linha.startswith("#"):
                continue
            ini, fim, texto = linha.split("|", 2)
            n += 1
            arquivo = os.path.join(saida, f"leg_{n:02d}.png")
            desenhar(texto.strip(), fonte, arquivo)
            print(f"{arquivo}|{float(ini)}|{float(fim)}")


if __name__ == "__main__":
    main()
