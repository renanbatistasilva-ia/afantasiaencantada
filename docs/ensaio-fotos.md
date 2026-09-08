# Guia de ensaio — fotos que faltam no site

**Quatro personagens** estão no site com **medalhão ilustrado** em vez de foto. Este guia é
para levar ao próximo ensaio.

> A contagem já esteve errada aqui três vezes: dizia cinco quando eram onze, depois dez, e
> agora são quatro. A última queda veio de uma releitura da pasta de referências, onde havia
> foto real de cinco personagens que eu tinha descartado por olhar a dimensão do arquivo em
> vez de abrir a imagem.

> As imagens que existiam antes para alguns deles eram geradas por IA e foram removidas: não
> mostravam a equipe de verdade. Quem reservava a Bela e a Fera vendo um salão renderizado
> recebia uma máscara de pelúcia. É o oposto do que o site promete em "personagens vivos".

## Quem precisa

### Os quatro que faltam

| Personagem | Quem é | Quando fotografar |
|---|---|---|
| **Bruxa do Mar** | **a vilã roxa de cabelo branco e tentáculos** | qualquer época |
| Maria Bonita & Cangaceiro | o casal do cangaço, chapéu de couro | qualquer época |
| Turma Junina | chapéu de palha, vestido de chita, quadrilha | **numa junina de verdade, junho** |
| Natal Encantado | o casal do Natal, sinos e vermelho | **dezembro** |

> O Brasil Encantado **deixou de ser o mundo sem nenhuma foto**: o Casal da Roça, o Milhinho
> Junino e a Turma do Bairro ganharam imagem. Falta a Maria Bonita e a Turma Junina.

> ⏰ **Dois são sazonais.** A Turma Junina fica muito melhor num arraiá real, em junho, e o
> Natal Encantado em dezembro. Se a próxima festa dessas já está no calendário, essas duas se
> resolvem sozinhas — basta alguém lembrar de fotografar direito no dia.

---

## O que o site usa de cada personagem

**Duas fotos resolvem.** Uma terceira é bem-vinda e aparece na página individual do
personagem.

**1. Principal — corpo inteiro ou três quartos**
Entra na moldura em arco grande, na página do mundo e na página do personagem.
Deixe folga acima da cabeça e nas laterais: o arco corta as bordas.

**2. Retrato — do peito para cima**
Vira o medalhão redondo na página de elenco e a moldura pequena ao lado da principal.

**3. Extra (opcional)**
Qualquer ângulo diferente. Entra na galeria da página do personagem.

---

## O padrão que funciona

Estas regras vêm do ensaio das princesas, que hoje é a melhor imagem do site.

### Sempre em retrato

Proporção **2:3 ou 3:4**, celular na vertical. O site inteiro usa moldura em arco vertical.
Foto deitada é cortada nas laterais e perde a cena — foi exatamente o problema da foto antiga
da Bela e a Fera, que era horizontal.

### Luz

- **Melhor:** fim de tarde, ao ar livre. É o que dá o ar premium.
- **Boa:** sombra aberta, à luz do dia. Sob uma árvore, na varanda.
- **Evitar:** flash direto em salão escuro. Achata a fantasia e endurece o rosto.

### Fundo

Limpo e afastado da pessoa: árvores, parede lisa, jardim.

**O que já fez descartar foto:**
- porta de saída e placa de emergência
- cadeira e mesa de restaurante
- banner e mesa de bolo do buffet
- alguém da equipe sentado ao fundo
- letreiro com nome de outro estabelecimento

### Nunca

- **Print de Instagram ou story.** A interface do app fica gravada na imagem — indicador de
  carrossel, botão de mudo, bolha de perfil. Mande sempre o arquivo original.
- **Imagem gerada por IA.** Mostra alguém que não é a equipe e não é o que o cliente recebe.

### Resolução

Qualquer celular recente serve. O bom ensaio veio em 3808×5712; o site reduz para 1600px de
altura. **Mande o arquivo original**, sem reduzir e sem passar por WhatsApp, que comprime.

---

## Enquadramento sugerido por personagem

**Princesa do Baile**
Vestido de baile pede corpo inteiro com a saia aberta. Escada ou parede clara ao fundo.

**Arqueira Valente**
Corpo inteiro com o arco visível — é o que identifica a personagem à primeira vista.

**Bruxa do Mar** *(a vilã roxa, de cabelo branco)*
Retrato dramático. A fantasia tem volume, então três quartos funciona melhor que corpo
inteiro.

**Cavaleiro das Sombras**
Corpo inteiro; contraluz combina com o personagem. Vale um retrato fechado da máscara.

**Heróis do Pijama**
Os três juntos, corpo inteiro. Um retrato de cada, se der tempo.

**Maria Bonita & Cangaceiro**
Os dois juntos, corpo inteiro, com o chapéu de couro bem visível — é o que identifica o
cangaço à primeira vista. Fim de tarde combina especialmente com essa fantasia.

**Casal da Roça**
Os dois juntos. Verde ao fundo, se houver. O pé descalço faz parte do personagem: não corte
na altura do joelho.

**Milhinho Junino**
Mascote de corpo inteiro, sempre. Cabeça de mascote em retrato fechado fica estranha. De pé,
em movimento, melhor ainda.

**Gabby e Amigos**
Corpo inteiro com os gatinhos à vista. Se forem bonecos de mão, enquadre para aparecerem.

**Turma Junina**
O grupo em roda ou de mãos dadas, no arraiá. Bandeirinha ao fundo é bem-vinda aqui — é o
único caso em que fundo carregado ajuda em vez de atrapalhar.

**Natal Encantado**
Corpo inteiro, com árvore ou luzes ao fundo. Vale um retrato para o medalhão.

---

## Vale registrar também

**Foto em festa, com criança.** São as que mais convertem e alimentam a seção Momentos, que é
onde o site prova que as festas aconteceram de verdade. Vale para qualquer personagem, não só
para os quatro desta lista.

---

## Quando as fotos chegarem

O encaixe é rápido: as fotos são processadas para no máximo 1600px e 150–300KB, entram no
array `photos` em `src/data/characters.ts` com o enquadramento ajustado, e eles saem do
medalhão de uma vez — na página do mundo, na página de elenco, na página individual e nos
chips do formulário de reserva.
