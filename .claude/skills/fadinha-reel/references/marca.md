# A marca, para quem vai escrever com a fadinha

## As três regras que não mudam

**1. A IA faz o cenário. Nunca uma pessoa.**
`docs/ensaio-fotos.md` proíbe imagem gerada de personagem porque "mostra alguém que não é a
equipe e não é o que o cliente recebe". Cenários vazios podem ser gerados; a fadinha pode ser
gerada (é desenho); atrizes, crianças e famílias vêm só de foto e vídeo reais. Quando um prompt
for compor com foto real por cima, termine-o com `NO PEOPLE, empty set, no characters`.

A nuance que importa: **animar uma foto real da equipe é permitido; inventar uma pessoa, não.**
Uma foto do elenco pode ganhar movimento de foto viva por image-to-video — a pessoa segura a
pose, respira, pisca, o tecido mexe, as bandeirinhas balançam. Continua sendo a atriz de
verdade. O que não pode é a IA mudar quem ela é: rosto, dentes, mãos, figurino. Por isso o
movimento é mínimo, a câmera fica parada, e cada clipe é conferido contra a foto original antes
de entrar. Detalhes no Passo 3 do SKILL.md (modo C).

**2. Os nomes são os do site.**
O site inteiro renomeia de propósito e os nomes de IP só aparecem em caminho de arquivo, nunca
em texto visível. Um vídeo público no Instagram fica mais exposto que um site. As crianças
reconhecem pela imagem; a legenda não precisa ajudar.

| diga | nunca diga |
|---|---|
| Princesa do Mar | Ariel |
| Princesa da Torre | Rapunzel |
| Princesa da Neve | Branca de Neve |
| Princesa do Baile | Cinderela |
| Casal de Ratinhos | Mickey e Minnie |
| Heróis Aranha | Homem-Aranha |
| Cavaleiro das Sombras | Batman |
| Cachorrinhas Irmãs | Bluey e Bingo |
| Patrulha dos Filhotes | Patrulha Canina |
| Alienzinho Azul & Angel | Stitch |
| Guerreiras do K-Pop | (o nome do filme) |
| Turma do Bairro | Turma da Mônica |

A lista completa, com `blurb` e `story` de cada um, está em `src/data/characters.ts`. Em
dúvida, o arquivo vence esta tabela.

**3. A fadinha narra em primeira pessoa, e a voz é sempre a mesma.**
Escolhida uma voz, ela fica (`voz.md`). Trocar a voz entre reels é trocar a mascote.

## Quem é a fadinha

- **É a que abre a porta.** Não é ela que faz a mágica — são as atrizes, e a criança. Ela é a
  guia: sabe onde os personagens moram e leva a gente até lá. A frase-tese do filme-manifesto:
  *"Eu só abro a porta. Quem faz a mágica são elas — e ela."*
- **No site ela é discreta**: voa a 60 px, foge do cursor, faz reverência quando encurralada,
  deixa poeira dourada por onde passa. Entra e sai por um **anel de luz dourado do tamanho do
  corpo dela** — o portal. Nos vídeos o portal é a transição entre lugares.
- **Aparência** (para conferir gerações): asas translúcidas, vestido verde-oliva, varinha, poeira
  dourada. Referências em `Fadinha/Varias fadinhas variaveis.png` (várias poses) e
  `Prints-referencias-instagram/Fotos Alta resolução/Fadinha.png`.
- **Ela não mente.** Se o vídeo mostra fantasia gerada, ela diz que é sonho; o que aconteceu de
  verdade ela mostra com foto real. É por isso que a "virada" existe.

## Como ela fala

Voz próxima, quase sussurrada, como quem conta um segredo para uma criança sentada do lado.
Não é apresentadora infantil: sem voz de desenho, sem agudo, sem exclamação. O ritmo
desacelera quando a cena fica real. Frases curtas — até 12 palavras. Primeira pessoa.

Matéria-prima pronta, no tom certo (confira em `src/data/worlds.ts`):

| mundo | tagline |
|---|---|
| Reino Encantado | Onde as princesas descem do castelo para dançar na sua sala. |
| Heróis & Aventuras | Para crianças que atendem pelo nome de coragem. |
| Mundo dos Mascotes | Fofura em tamanho gigante, feita para abraçar. |
| Pop & K-Pop | O palco acende, o refrão explode. E a estrela é a sua filha. |
| Diversão & Desenhos | Direto da telinha para o meio da bagunça boa. |
| Datas Mágicas | Cada estação tem seu próprio feitiço. |
| Brasil Encantado | A magia também fala com sotaque daqui. |

Frases do site que já viraram fala dela: *"Aqui em cima moram os corajosos. Teia, capa, escudo
— e muito colo."* (o Cavaleiro das Sombras derrete "até a primeira criança pedir colo"); *"Em
junho eu desço pro arraiá. Anarriê — e ninguém fica sentado."* (da story da Turma Junina).

## O look das cenas geradas

O que faz sete imagens geradas parecerem um filme só é **a mesma frase de look, literalmente
igual, no fim de todo prompt**:

```
cinematic vertical 9:16, 35mm anamorphic, shallow depth of field, warm golden rim light,
deep plum and midnight-violet shadows (#251629, #362040), gold highlights (#c29553),
fine floating dust motes catching the light, slight atmospheric haze, subtle film grain
```

Acrescente `NO PEOPLE, empty set, no characters, no figures` quando a cena receber foto real
por cima (modo B), e a descrição da fadinha quando ela nascer na cena (modo A).

## O movimento das fotos reais (modo C)

Prompt-base para image-to-video a partir de uma foto do elenco — o que muda por cena é só o
que está entre colchetes:

```
Subtle live-photo motion only. The people keep exactly this pose and expression: natural
breathing, one slow blink, hair and fabric moving in a light breeze, [flags and lanterns
swaying gently in the background, warm light flicker]. Camera completely static. Do not
change faces, teeth, hands, clothes or costumes. Nobody talks, walks or turns. 5 seconds.
```

Mascote de corpo inteiro (Milhinho, cachorrinhas, tubarão): `the mascot sways very slightly
on its feet, arms held in place`. Nunca peça sorriso, aceno ou olhar para a câmera — é o que
faz o modelo redesenhar o rosto.

Paleta do site (`src/app/globals.css`): noite `#251629` · ameixa `#362040` · ameixa-luz
`#4b2c50` · porcelana `#faf3ec` · blush `#f3dbdc` · ouro `#c29553` · ouro-claro `#e9ce9c` · rosa
`#d28a9c` · rosa-profundo `#a44e68`. Fontes do site: Fraunces (display), Parisienne (script
dourada), Figtree (corpo) — não estão instaladas no sistema; para legenda queimada o
`legendas.py` usa Avenir Next / Helvetica.

## Especificação do Instagram

- **1080×1920, 30 fps, H.264, AAC 48 kHz**, até 90 s. Os `.MOV` reais já vêm nesse formato.
- **Zonas de segurança:** nada de texto nos **250 px do topo** nem nos **420 px de baixo**.
- **Legenda queimada sempre** — o feed toca mudo.
- **Capa:** quadro real, com criança se houver. Nunca cenário gerado.
- Trilha sem letra: letra briga com a locução. Caixinha de música → cordas → silêncio na
  virada → piano → resolução.

## Onde as coisas moram

| o quê | onde |
|---|---|
| clipes da fadinha em croma (4 × 10 s, 752×416) | `Fadinha/Videos Fadinha/` |
| PNGs da fadinha | `Fadinha/*.png`, `Prints-referencias-instagram/Fotos Alta resolução/Fadinha.png` |
| vídeos reais verticais (Ariel 23 s, Rapunzel 22 s) | `Prints-referencias-instagram/Fotos Alta resolução/*.MOV` |
| fotos do elenco | `public/images/<mundo>/` |
| fotos de festa real com criança | `public/images/momentos/` |
| receita de croma (site) | `scripts/fadinha-loop.sh` |
| saída dos reels | `Fadinha/reels/<slug>/` (fora do git) |
| contato | `@afantasiaencantada` · afantasiaencantada.com · (11) 93223-7456 |
