# Painel de leads — como mexer na senha

O painel fica em **afantasiaencantada.com/admin** e mostra os pedidos que chegaram pelo
formulário do site, mesmo os de quem desistiu antes de mandar a mensagem no WhatsApp.

Este documento cobre só a parte de acesso. Tudo aqui se faz no terminal, na pasta do projeto.

---

## Trocar a senha

```
npm run senha
```

Ele pergunta a senha nova duas vezes, sem mostrar o que você digita, e envia para a
Cloudflare. A senha antiga deixa de valer na hora.

**Quando fazer:** esqueceu a senha, ou desconfia que alguém viu.

Quem já estava com o painel aberto **continua aberto** — o cookie de sessão não depende da
senha. Se o motivo da troca for alguém ter conseguido entrar, rode o comando de baixo também.

## Desconectar todos os aparelhos

```
npm run sessoes:encerrar
```

**Quando fazer:** celular perdido ou roubado, ou desconfiança de que alguém está dentro do
painel. Na próxima vez que qualquer aparelho abrir `/admin`, a senha será pedida de novo.

A senha **não** muda com este comando. Se ela também vazou, rode `npm run senha` primeiro.

---

## Aviso por e-mail quando entra um pedido

Sem isto, um pedido novo só aparece para quem abrir o painel — e o site promete
"respondemos em minutos". Ligar é uma vez só, e depende de dois cliques no painel da
Cloudflare que nenhum comando faz por você.

**1. Habilitar o envio** para o domínio: painel da Cloudflare → **Compute → Email Service →
Email Sending → Onboard Domain**, escolhendo `afantasiaencantada.com`.

> **Email Sending e Email Routing são serviços separados.** Ativar só o Routing não habilita o
> envio — o Worker falharia com `E_SENDER_NOT_VERIFIED`. É preciso o onboarding de envio para
> o remetente `avisos@afantasiaencantada.com` ser aceito.

A Cloudflare acrescenta os registros sozinha (SPF, DKIM, DMARC e MX de devolução no subdomínio
`cf-bounce`). Conferido em 09/09/2026: **o domínio não tinha nenhum MX nem TXT**, então não há
e-mail existente para quebrar. Se um dia passar a ter, reveja isto antes.

**2. Verificar o endereço que vai receber.** Em *Destination addresses*, cadastrar a caixa que
recebe os avisos — hoje, `fantasiaencantadaa@gmail.com`. Gmail funciona normalmente; é para
isso que o Email Routing existe.

> ⚠️ **A confirmação chega naquela caixa.** A Cloudflare manda um e-mail com um link, e **quem
> tem a senha dela precisa clicar**. Não há como fazer isso do lado de fora — é o único passo
> que depende do cliente.

**3. Guardar o endereço como segredo**, no terminal:

```
npx wrangler secret put AVISO_EMAIL_PARA
```

Vai em segredo, e não no `wrangler.jsonc`, porque este repositório é público: e-mail em texto
puro vira alvo de robô de spam.

### Mais de um destinatário, e como começar sem esperar o clique

O segredo aceita **vários endereços separados por vírgula**:

```
seu-email@exemplo.com, fantasiaencantadaa@gmail.com
```

Isso resolve o impasse de quem monta o site não ter a caixa do cliente. Verifique um endereço
seu, ponha no segredo e o aviso passa a funcionar hoje — e dá para **provar** que funciona,
o que não daria se o destino fosse só uma caixa que você não abre. Quando o cliente clicar no
link dele, é só rodar o comando de novo com os dois endereços.

Trocar quem recebe **não exige mexer em código nem publicar de novo**: o segredo sozinho já
muda o destino.

> Quem monta o site recebendo nome de criança, telefone e endereço a cada pedido é decisão do
> cliente, não conveniência técnica. Por isso sair da lista é o mesmo comando.

> É o quarto recurso da Cloudflare aqui que exige clique no painel antes de o binding
> funcionar — R2, Analytics Engine e Zero Trust foram os outros três.

**Enquanto os três passos não estiverem feitos**, o site funciona normalmente e o pedido
continua sendo gravado; só o aviso não sai.

### Se os avisos pararem de chegar

O pedido **não se perde**: ele continua no painel. O aviso é que atrasa.

Para ver o motivo, com o site publicado:

```
npx wrangler tail
```

e procurar a linha `aviso de pedido falhou`. As causas comuns são o endereço de destino ter
sido removido da lista de verificados, ou o segredo `AVISO_EMAIL_PARA` não existir.

## O que este sistema não faz

**Não dá para desconectar um aparelho só.** O acesso é provado por um cookie assinado, sem
lista de sessões guardada no servidor — então ou todas as sessões continuam, ou todas caem. É
por isso que existe só o comando "encerrar todas".

**A sessão dura 7 dias, e se renova a cada uso.** Quem abre o painel toda semana nunca precisa
digitar a senha de novo. Em compensação, um celular perdido continua com acesso por até uma
semana se nada for feito — daí a importância do comando acima.

**Não existe "esqueci minha senha" na tela.** Foi decisão, não esquecimento. Duas razões:

1. Um Worker da Cloudflare não consegue reescrever o próprio segredo. Para você mesma trocar a
   senha pelo navegador, o hash teria que sair do segredo e ir para o banco de dados — e
   segredo não pode ser lido de volta nem por quem tem a conta, enquanto linha de banco pode.
   Seria perder proteção para ganhar conveniência.
2. Todo fluxo de "esqueci minha senha" é uma porta a mais na internet, numa tela que mostra
   nome e idade de criança. Para um painel de uma pessoa só, não paga o risco.

---

## A senha certa

**Use a senha que o celular gerar e guardar por você**, não uma que você tenha que lembrar.

Isso não é preciosismo. O que protege o painel de alguém tentando adivinhar não é o número de
tentativas — é a senha ser impossível de chutar. E com o preenchimento automático do celular,
uma senha aleatória de 16 caracteres é mais **fácil** de usar no dia a dia do que uma
decorada: você nunca digita.

Ao criar, o iPhone e o Android oferecem "senha forte" e guardam sozinhos. Aceite a oferta.

Acento funciona normalmente — `senhã` digitada no celular confere com a mesma senha gerada no
computador. Espaço no começo ou no fim é ignorado.

---

## Se nada funcionar

Não existe destravamento automático. Rode `npm run senha`, defina uma senha nova e entre com
ela. O comando funciona mesmo sem você lembrar a atual: ele substitui, não confere.

Isso significa que **quem tem acesso a este projeto e à conta da Cloudflare consegue trocar a
senha do painel**. É o mesmo poder de quem tem a conta — que já pode ler os leads direto no
banco de qualquer jeito. Vale saber, para não guardar este acesso onde não deveria.
