---
name: fadinha-reel
description: Cria reels e vídeos curtos para o Instagram da Fantasia Encantada com a fadinha (a mascote) como narradora — roteiro plano a plano, prompts de cena para Higgsfield ou outro gerador de IA, locução e legenda, e a montagem final em MP4 vertical com ffmpeg. Use sempre que o usuário falar em reel, reels, stories, vídeo ou post para o Instagram, animação da fadinha, roteiro de vídeo, história com a fadinha, cena, portal, narração, voz da fadinha, ou em gerar imagem/vídeo com Higgsfield, Kling, Veo, ElevenLabs ou IA — mesmo que não diga a palavra "reel". Qualquer vídeo curto de marca com a mascote passa por aqui.
---

# Reel com a fadinha

A fadinha é a mascote da Fantasia Encantada (personagens vivos para festas infantis, São
Paulo). No site ela só voa e brilha; nos vídeos ela **narra em primeira pessoa**. Este skill
transforma uma ideia de história num reel pronto — ou, quando faltar alguma conexão, em tudo o
que o usuário precisa para terminar à mão.

## O que sai daqui

Uma pasta `Fadinha/reels/<slug-da-historia>/` com:

| arquivo | o que é |
|---|---|
| `roteiro.md` | plano a plano: tempo · imagem · fadinha · fala · texto na tela · som |
| `cenas/prompts.md` | um prompt por cena, pronto para colar em qualquer gerador |
| `cenas/*.mp4` | as cenas geradas (quando a Higgsfield está conectada) |
| `voz/locucao.md` | as falas corridas + direção de voz |
| `voz/*.mp3` | a locução gerada (quando a ElevenLabs está conectada) |
| `legendas.txt` | `inicio\|fim\|texto`, uma por linha |
| `montagem.txt` | a ordem das cenas para o `montar-reel.sh` |
| `reel.mp4` | 1080×1920 · 30fps · H.264 · legendas queimadas |

A pasta `Fadinha/` está no `.gitignore` de propósito: o repositório é público e vídeo gerado
não é código-fonte. Nunca escreva mídia gerada em `public/` — ela iria para o deploy.

## Leia antes de escrever qualquer linha

1. **`references/marca.md`** — as três regras que não mudam, a paleta, a frase de look dos
   prompts, quem é a fadinha e como ela fala. Sem isso o vídeo sai genérico.
2. **`src/data/characters.ts` e `src/data/worlds.ts`** — os nomes públicos de cada personagem,
   os `blurb` e as `story`, as taglines de cada mundo. Os nomes do site são renomeados de
   propósito (*Princesa do Mar*, nunca o nome da Disney); o vídeo usa exatamente esses. E os
   blurbs já são falas prontas, escritas no tom certo — aproveite-os antes de inventar.
3. **`references/fadinha-clipes.md`** — só se for usar os clipes filmados dela (modo B, abaixo).
4. **`references/roteiro-exemplo.md`** — o filme-manifesto de 75s, como exemplo do formato.

## Descubra o que está conectado

Procure na lista de ferramentas nomes que comecem com `mcp__higgsfield` e `mcp__elevenlabs`
(use `ToolSearch` se estiverem adiadas). O `ffmpeg` está sempre em `/opt/homebrew/bin`.

| disponível | o que fazer |
|---|---|
| MCP `mcp__higgsfield__*` | gerar as cenas (modo A, B ou C) direto pelas ferramentas |
| CLI `higgsfield` no PATH, ou `FAL_KEY` em `.env.local` | `scripts/gerar-movimento.sh` — mesma coisa, por script (o MCP só entra em sessões novas; o script funciona sempre) |
| MCP `mcp__elevenlabs__*` ou `ELEVENLABS_API_KEY` em `.env.local` | locução e efeitos com a voz de `references/voz.md` (`scripts/gerar-voz.sh`) |
| nada | entregar roteiro, prompts e locução em texto — o usuário gera na interface e volta para a montagem |

Confira com `command -v higgsfield` e `grep -c KEY .env.local` antes de decidir. Não trave por
falta de conexão: o roteiro e os prompts já valem sozinhos, e o usuário pode colá-los na
Higgsfield pelo navegador. Diga claramente o que foi gerado e o que ficou para ele.

Chaves ficam **só** em `.env.local` (ignorado pelo git; o repositório é público). Nunca peça uma
chave pelo chat nem a escreva em outro arquivo.

## Passo 1 — A história

Pergunte no máximo duas coisas, e só se faltarem: **qual mundo ou personagens** entram, e
**qual a ocasião** (aniversário, festa junina, Halloween, café da manhã com princesa…).

Duração: **30 a 45 s** para um reel de tema; **60 a 75 s** só para um filme de apresentação da
marca. O Reels premia retenção, e cada batida de cena custa 4 s — a conta fecha rápido.

## Passo 2 — O roteiro

A gramática nasceu dos clipes dela: cada um começa com ela saindo de um portal dourado, e um
deles termina com ela desenhando um anel de luz e sumindo lá dentro. Então a montagem é:

1. **Gancho (0–3 s).** O portal rasga a tela inteira — não um cantinho — e ela voa na direção
   da câmera com uma frase que promete algo à mãe que está rolando o feed.
   *"Toda criança tem um personagem favorito. Eu sei onde ele mora — vem ver."*
2. **Batidas (4 s cada).** Portal abre num canto → ela sobrevoa a cena → uma fala → portal
   fecha. Corte pelo brilho do portal fechando, nunca corte seco. Cada batida é um lugar.
3. **A virada (opcional, 5–6 s).** A trilha some por completo e o portal abre num lugar comum —
   um corredor de prédio, uma porta com tapetinho. Tudo antes era sonho; tudo depois aconteceu.
   Use quando a história tiver um momento real para mostrar.
4. **O real.** Só fotos e vídeos de festas reais (`public/images/momentos/`, os `.MOV` em
   `Prints-referencias-instagram/Fotos Alta resolução/`). Nenhum quadro gerado aqui.
5. **Convite.** Ela sai pelo anel de luz e termina com **uma pergunta** — pergunta na última
   fala puxa comentário, e comentário é o que o Instagram premia.
   *"Quem que o seu filho sonha em conhecer?"* Depois: `@afantasiaencantada`.

Falas: primeira pessoa, no máximo 12 palavras, sem exclamação. Ela conta um segredo, não
apresenta um programa. Escreva `roteiro.md` no formato de `references/roteiro-exemplo.md`.

## Passo 3 — As cenas

Dois modos. Escolha por cena, não por vídeo.

**Modo A — a fadinha nasce dentro da cena.** Precisa da Higgsfield com a fadinha registrada
como personagem (o id fica em `references/ids.md`; se estiver vazio, registre uma vez a partir
de `Fadinha/Varias fadinhas variaveis.png` e `Prints-referencias-instagram/Fotos Alta
resolução/Fadinha.png`, e anote o id). O prompt descreve a cena, o que ela faz, e termina com
a frase de look de `marca.md`. Clipes de 5 s.

Depois de **cada** geração, antes da próxima: extraia um quadro
(`ffmpeg -ss 2 -i cena.mp4 -frames:v 1 q.png`), leia a imagem e compare com a referência —
asas translúcidas, vestido verde-oliva, varinha, cabelo. Se a aparência escorregou, refaça
esta cena antes de gastar crédito na seguinte. Consistência de personagem em vídeo não é
perfeita; conferir cedo é o que segura o custo.

**Modo B — cena vazia + a fadinha filmada.** O prompt termina com `NO PEOPLE, empty set`; a
fadinha entra depois, recortada dos clipes originais por `scripts/chave-fadinha.sh`. Use quando
a Higgsfield não estiver conectada, ou quando ela precisar fazer um movimento que só existe
filmado (a entrada e a saída pelo portal). Como sobrepor está em `references/fadinha-clipes.md`.

**Modo C — a foto real ganha movimento.** Uma foto parada com push-in parece slide; a mesma
foto com movimento de foto viva parece filmada — e é o que faz a diferença entre um reel bom e
um perfeito. Mande a foto do elenco para image-to-video (Higgsfield → Kling, ou o que estiver
na lista) com um pedido de **movimento mínimo**: pose mantida, respiração, um piscar, cabelo e
tecido numa brisa leve, bandeirinhas e luzes ao fundo balançando, **câmera parada**, 5 s. O
prompt-base está em `references/marca.md`; os por cena ficam em `cenas/prompts.md`.

Conferência obrigatória, porque é aqui que a IA trai: extraia quadros em 0 s, 2,5 s e 5 s e
compare com a foto original — olhos, dentes, mãos, figurino. Boca não abre, ninguém anda, ninguém
vira o rosto. Se mudou, refaça uma vez; se mudou de novo, **a foto fica parada** — uma cara
errada custa mais que um slide. A cena que o vídeo apresenta como "isso aqui aconteceu" (o real,
com criança) não recebe movimento gerado: ela vale mais intocada. O clipe gerado entra no
`compor-cena.sh` como vídeo, no lugar da foto; use `--passeio` se a foto for horizontal.

**Pessoas reais nunca são inventadas.** Os personagens vêm das fotos em `public/images/` (paradas
ou em modo C) ou dos vídeos reais. Regra de `docs/ensaio-fotos.md`: mostrar alguém que não é a
equipe é o oposto do que "personagens vivos" promete. A fadinha é desenho; as atrizes, não.

Grave todos os prompts em `cenas/prompts.md` mesmo quando gerar por aqui — o usuário vai
querer regenerar uma cena na interface, e o prompt tem que estar lá.

## Passo 4 — A voz

O Instagram toca mudo por padrão. A legenda é obrigatória sempre; a voz é o que faz quem
ligou o som ficar.

**Com ElevenLabs:** use o `voice_id` de `references/voz.md`. Se estiver vazio, peça ao usuário
para escolher uma voz **uma única vez** e anote — a fadinha tem uma voz só, para sempre, do
mesmo jeito que o rosto de uma princesa não muda entre festas. Gere **um arquivo por fala**
(`voz/01.mp3`, `voz/02.mp3`…): fica fácil posicionar cada uma no tempo certo. Efeitos sonoros
(o sino do portal, a faísca) também saem de lá.

**Sem ElevenLabs:** escreva `voz/locucao.md` com as falas corridas e a direção de voz de
`marca.md`, para a locutora.

## Passo 5 — A montagem

Este ffmpeg não tem `drawtext` nem `subtitles`. A legenda é desenhada pelo
`scripts/legendas.py` (PIL, uma PNG transparente por fala) e sobreposta pelo
`scripts/montar-reel.sh`, que faz tudo:

```bash
.claude/skills/fadinha-reel/scripts/montar-reel.sh Fadinha/reels/<slug>
```

Ele espera na pasta:

- `montagem.txt` — uma cena por linha, `arquivo|duracao` (imagem ganha push-in lento; vídeo é
  cortado na duração). Caminhos relativos à pasta do reel ou absolutos.
- `legendas.txt` — `inicio|fim|texto` em segundos.
- `voz.txt` — `arquivo|inicio`, opcional.
- `musica.mp3` — opcional; entra a −14 dB sob a voz.

Sai `reel.mp4`. Regras que o script já aplica e você não precisa lembrar: zonas de segurança
(nada de texto nos 250 px do topo nem nos 420 px de baixo — a interface do Instagram cobre),
30 fps, `yuv420p`, `faststart`, `loudnorm`.

Cada cena com a fadinha filmada por cima (modo B) sai do `scripts/compor-cena.sh` — fundo
(foto, vídeo ou `roxo`) + pasta do `chave-fadinha.sh` → `cenas/sNN.mp4`, que entra no
`montagem.txt`. Ele já sabe o push-in, o passeio horizontal para foto deitada (`--passeio`), o
"sumir em poeira" (`--some`) e a velocidade certa dela (24 q/s). Não escreva o filtro do ffmpeg
à mão: foi assim que ela saiu acelerada e em cima do rosto de uma atriz.

Onde ela fica: **nunca sobre um rosto**. Ao lado, sobre bandeirinhas, saia, cerca — ela é
pequena e voa em volta dos personagens. Longe da faixa da legenda (≈ 1150–1500 px) e dos 250 px
do topo. Tamanho: `--escala` até 1,9 (≈ 670 px, 35 % do quadro); acima disso ela amolece,
porque a fonte tem 351 px. A escala é do quadro inteiro dela — nunca a estique pela largura.

## Passo 6 — Conferência antes de entregar

- Assista **sem som**: a história se sustenta? Se não, a legenda está fraca.
- Todos os nomes falados e escritos batem com `characters.ts`? Nenhum nome de IP escapou?
- A fadinha nunca passa de 35 % da altura; nas cenas geradas, a aparência é a mesma em todas?
- Pause em três instantes e amplie: franja verde nas asas? (só no modo B)
- Nada de texto nas zonas cobertas pelo Instagram?
- Capa: um quadro **real**, com criança se houver — nunca um quadro gerado.
- Duração dentro do combinado.

## Entrega

Envie `reel.mp4` com `SendUserFile` (ou `roteiro.md` e `cenas/prompts.md`, quando não houver
geração). Diga em duas linhas o que foi gerado aqui e o que ficou para o usuário fazer — colar
prompts, conectar um MCP, escolher a voz.
