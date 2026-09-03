# Guia de ensaio — fotos que faltam no site

Seis personagens estão no site com **medalhão ilustrado** em vez de foto, porque não existe
foto real deles. Este guia é para levar ao próximo ensaio.

> As imagens que existiam antes para alguns deles eram geradas por IA e foram removidas: não
> mostravam a equipe de verdade. Quem reservava a Bela e a Fera vendo um salão renderizado
> recebia uma máscara de pelúcia. É o oposto do que o site promete em "personagens vivos".

## Quem precisa

| Personagem | O que já existe |
|---|---|
| Princesa do Baile | nada |
| Arqueira Valente | nada |
| Bruxa do Mar | nada |
| Cavaleiro das Sombras | nada |
| Heróis do Pijama | nada |
| Casal de Ratinhos | nada |

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

**Bruxa do Mar**
Retrato dramático. A fantasia tem volume, então três quartos funciona melhor que corpo
inteiro.

**Cavaleiro das Sombras**
Corpo inteiro; contraluz combina com o personagem. Vale um retrato fechado da máscara.

**Heróis do Pijama**
Os três juntos, corpo inteiro. Um retrato de cada, se der tempo.

**Casal de Ratinhos**
A dupla junta, corpo inteiro, e um plano mais fechado dos dois.

---

## Vale registrar também

**Foto em festa, com criança.** São as que mais convertem e alimentam a seção Momentos, que é
onde o site prova que as festas aconteceram de verdade. Vale para qualquer personagem, não só
para os seis desta lista.

---

## Quando as fotos chegarem

O encaixe é rápido: as fotos são processadas para no máximo 1600px e 150–300KB, entram no
array `photos` em `src/data/characters.ts` com o enquadramento ajustado, e os seis saem do
medalhão de uma vez — na página do mundo, na página de elenco, na página individual e nos
chips do formulário de reserva.
