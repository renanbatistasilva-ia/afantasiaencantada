# Painel de leads — como mexer na senha

O painel fica em **afantasiaencantada.com/admin** e mostra os pedidos que chegaram pelo
formulário do site, mesmo os de quem desistiu antes de mandar a mensagem no WhatsApp.

Tudo aqui se faz no terminal, na pasta do projeto.

---

## Trocar a senha

```
npm run senha
```

Ele pergunta a senha nova duas vezes, sem mostrar o que você digita, envia para a
Cloudflare e **confere no painel de verdade que ela entra** antes de dizer que terminou. A
senha antiga deixa de valer na hora.

Só entregue a senha a alguém depois de ver o `✓ conferida`. Se aparecer o aviso de que ainda
não entrou, quase sempre é a propagação do segredo demorando — espere um minuto e confirme com
o comando abaixo.

**Quando fazer:** esqueceu a senha, ou desconfia que alguém viu.

## Conferir uma senha sem trocar nada

```
npm run senha:conferir
```

Pergunta a senha e responde se ela entra ou não. Não altera nada. Serve para o caso mais comum
do dia a dia: alguém diz "não consigo entrar" e você descobre em cinco segundos se é a senha
dela ou se é o painel.

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

### O primeiro aviso caiu no spam — e por quê

Aconteceu em 09/09/2026, no iCloud, com a mensagem chegando íntegra. Duas causas, nesta ordem:

**1. O Email Routing cria SPF e DKIM, mas não cria DMARC.** O painel da Cloudflare avisa
("Block fake emails sent from @afantasiaencantada.com addresses"). Sem DMARC, o filtro não tem
política para consultar, e isso conta contra. O registro é gratuito:

```
Nome:      _dmarc
Tipo:      TXT
Conteúdo:  v=DMARC1; p=none;
```

Começar em `p=none` é de propósito: ele apenas observa. Uma política restritiva sem saber se o
SPF ou o DKIM alinham derrubaria a entrega em vez de melhorar.

**2. O domínio nunca tinha enviado e-mail.** Aquela foi a primeira mensagem da vida dele.
Caixa nenhuma confia num remetente sem histórico, mesmo autenticado — a reputação se constrói
com o tempo e com o destinatário tirando do spam.

Por isso, **marcar "não é lixo eletrônico" e adicionar `avisos@afantasiaencantada.com` aos
contatos** pesa mais, numa caixa pessoal, que qualquer registro de DNS.

> Para diagnosticar de verdade, olhe o cabeçalho da mensagem (`Authentication-Results`,
> `Return-Path`). É lá que se lê se o SPF e o DKIM alinharam com o domínio — e não dá para
> descobrir isso por fora.

### Se os avisos pararem de chegar

O pedido **não se perde**: ele continua no painel. O aviso é que atrasa.

Para ver o motivo, com o site publicado:

```
npx wrangler tail
```

e procurar a linha `aviso de pedido falhou`. As causas comuns são o endereço de destino ter
sido removido da lista de verificados, ou o segredo `AVISO_EMAIL_PARA` não existir.

---

## Abrir o painel na sua máquina

`npm run dev` **não serve o painel**. Ele roda `next dev`, que entrega as páginas mas não as
rotas `/api/*` — elas moram no Worker (`worker/index.ts`). Sem elas, `POST /api/admin/sessao`
não existe e **nenhuma senha entra**, o que se parece com senha errada e não é.

O comando certo é:

```
npm run dev:painel
```

Ele roda `wrangler dev`: gera o site, serve o `out/`, liga o D1 local e lê o `.dev.vars`.

**A senha local é outra.** `npm run senha` envia o hash para a Cloudflare, isto é, **para a
produção** — ele não escreve no `.dev.vars`. Para ter uma senha só de desenvolvimento, gere o
hash e cole no arquivo à mão:

```
node -e 'const c=require("crypto"),s=c.randomBytes(16),i=210000,b=x=>x.toString("base64url");c.pbkdf2("SUA-SENHA-LOCAL".normalize("NFC"),s,i,32,"sha256",(e,d)=>console.log(`PAINEL_SENHA_HASH=pbkdf2$${i}$${b(s)}$${b(d)}`))'
```

O `.dev.vars` precisa dos três: `PAINEL_SENHA_HASH`, `PAINEL_SESSAO_SEGREDO` (32 caracteres ou
mais) e, se quiser testar o aviso, `AVISO_EMAIL_PARA`. O arquivo é ignorado pelo git.

Banco local vazio? `npm run db:local` cria as tabelas. Os pedidos ficam em
`.wrangler/state/`, separados da produção — dá para inventar dados à vontade ali sem risco.

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
computador. Espaço no começo ou no fim é ignorado, **dos dois lados**: ao definir a senha e ao
entrar com ela.

> Esse "dos dois lados" foi caro. Até 22/09/2026 só o lado de entrar aparava os espaços; o
> `senha.sh` gravava o hash da senha **com** o espaço. Quando isso acontecia, não existia mais
> nada que a dona pudesse digitar para entrar — nem a senha com o espaço, porque o painel
> apara antes de conferir. Ela ficou trancada fora com a senha certa na mão. É também por
> isso que o `npm run senha` agora só termina depois de provar que a senha entra.

---

## Se nada funcionar

Não existe destravamento automático. Rode `npm run senha`, defina uma senha nova e entre com
ela. O comando funciona mesmo sem você lembrar a atual: ele substitui, não confere.

Isso significa que **quem tem acesso a este projeto e à conta da Cloudflare consegue trocar a
senha do painel**. É o mesmo poder de quem tem a conta — que já pode ler os leads direto no
banco de qualquer jeito. Vale saber, para não guardar este acesso onde não deveria.
