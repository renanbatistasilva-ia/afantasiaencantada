# Os clipes filmados da fadinha

Quatro clipes em `Fadinha/Videos Fadinha/Fadinha video (N).mp4` — **10,04 s, 752×416,
H.264, fundo verde**. Medidos em 10/09/2026; refazer a medição custa uma hora.

**Cada clipe já começa com o portal dourado e ela saindo de dentro dele.** É a animação que o
site imita, e é a gramática dos reels.

| clipe | portal | fada inteira | altura dela | serve para |
|---|---|---|---|---|
| 1 | 0,25 s | 1,0 – 9,5 s | 351 px | o gancho — é a maior no quadro; sobe, gira, pisca (2,40 s) |
| 2 | 0 s | 0,25 – 9,75 s | 333 px | a varinha estoura em faíscas e vira um coração de luz (4,40 s) |
| 3 | 0,25 s | 1,0 – 8,75 s | 333 px | voo à deriva (5,15 s) e **a saída: ela desenha um anel de luz e some dentro dele, 7,13 – 8,47 s** |
| 4 | 0 s | 0,5 – 9,0 s | 301 px | **a entrada pelo portal, 0,00 – 1,30 s**; de frente e parada, 3,58 s (`serena`, termina antes de levantar a varinha); **a saída, 8,70 – 9,75 s** (o anel fecha e ela encolhe para dentro) |

Deslocamento dela dentro do quadro (para não cortar asa ao enquadrar): clipe 1 · 94 px
horizontal, 49 vertical · clipe 2 · 55 × 33 · clipe 3 · 84 × 43 · clipe 4 · 66 × 20.

## Não use os `.webp` do site

`public/images/marca/fadinha/*.webp` foram gerados para exibir a 60 px e têm 120–180 px de
largura. Num reel de 1080×1920 viram borrão. Recorte de novo a partir dos `.mp4`, na resolução
nativa:

```bash
.claude/skills/fadinha-reel/scripts/chave-fadinha.sh 4 0.00 1.30 Fadinha/reels/<slug>/fada-entrada
.claude/skills/fadinha-reel/scripts/chave-fadinha.sh 3 7.13 1.34 Fadinha/reels/<slug>/fada-saida --mov
```

Sai uma sequência `q0001.png…` RGBA do quadro inteiro (posição preservada) e, com `--mov`, um
`fadinha.mov` ProRes 4444 com alfa para CapCut ou Resolve. O script imprime a altura dela em
pixels — é o número para a escala.

## A chave

É a mesma de `scripts/fadinha-loop.sh`, feita em Python e não no ffmpeg: o `despill` do
ffmpeg é global e apaga o vestido verde-oliva dela.

- alfa contínuo: `a = 1 − ((g − max(r,b))/255 − 0,06) / 0,28` — corte seco mataria as asas, que
  são translúcidas e deixam o fundo passar
- despill: `g → max(r,b) + (g − max(r,b)) × 0,15` — só encosta no excesso de verde

Dá 21–23 % de pixels com alfa parcial (asas e bordas) e nenhuma franja verde sobre os roxos.

## Sobrepor numa cena (modo B)

Use `scripts/compor-cena.sh` — ele encapsula o comando abaixo com as opções certas:

```bash
scripts/compor-cena.sh public/images/brasil/milhinho-junino.jpg 4 Fadinha/reels/<slug>/fada-giro cenas/s4.mp4 --x -300 --y 200 --some
scripts/compor-cena.sh public/images/brasil/turma-junina.jpg 4 Fadinha/reels/<slug>/fada-paira cenas/s2.mp4 --passeio --escala 1.05 --x -250 --y 650
scripts/compor-cena.sh roxo 3 Fadinha/reels/<slug>/fada-gancho cenas/s1.mp4 --escala 1.6 --x 0 --y 480
```

Combinações que funcionaram no reel da festa junina: gancho = clipe 1 de 0 s a 1,6×; batidas
com `paira` (1,05×) ou `serena` (1,25×) seguradas no último quadro; uma batida com `giro` +
`--some`, para ela sumir em poeira como no site; virada = `serena` 1,3× no roxo; convite =
saída 1,5× no roxo com `--some`.

O comando por baixo, caso precise de algo que o script não faz:

```bash
ffmpeg -i cena.mp4 -framerate 24 -i fada-entrada/q%04d.png \
  -filter_complex "[1:v]format=rgba,scale=-2:560[f];[0:v][f]overlay=x=W-w-120:y=420:shortest=1,format=yuv420p" \
  -c:v libx264 -crf 18 -preset slow -r 30 cena-com-fada.mp4
```

Os clipes são **24 q/s** — o `-framerate 24` da sequência tem que bater com isso, senão ela
voa 25 % mais rápido. O `chave-fadinha.sh` imprime o fps que leu do arquivo.

Três regras que já custaram retrabalho:

1. **A escala vem da altura** (`scale=-2:ALTURA`), nunca da largura. Pela largura, um clipe de
   asas abertas encolhe o corpo dela e ela muda de tamanho entre cenas.
2. **No máximo 35 % da altura do quadro** (≈ 670 px). Ela tem 351 px nativos; a 2× ainda
   aguenta, acima amolece. No gancho, o que preenche a tela é o portal, não ela.
3. **Não repita o mesmo clipe em cenas vizinhas.** O movimento dela é reconhecível. Rodízio
   sugerido para sete cenas: 1 · 2 · 4 · 3 · 1 · 2 · 4.

A velocidade dos clipes é a do arquivo (`ffprobe` diz o fps); o `chave-fadinha.sh` respeita.
Se a cena for mais curta que o trecho, corte o trecho — não acelere a fadinha.
