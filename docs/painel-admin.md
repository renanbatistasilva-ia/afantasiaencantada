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
