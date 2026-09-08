import type { Character } from "./types";

export const characters: Character[] = [
  // ——— Reino Encantado ———
  {
    slug: "sereia-do-mar",
    name: "Princesa do Mar",
    worlds: ["reino-encantado"],
    blurb: "Chega cantando como quem acabou de ganhar pernas, e um mundo inteiro.",
    story:
      "Ela trocou o fundo do mar por um par de pernas e uma curiosidade sem tamanho. Chega encantada com tudo o que vê na superfície, talheres, bolhas de sabão, o riso das crianças, e transforma qualquer festa num pedacinho de oceano. Onde ela passa, sobra brilho de escama e vontade de cantar.",
    emblem: "concha",
    photos: [
      {
        src: "/images/reino/ariel-danca.jpg",
        alt: "Princesa do mar de cabelos vermelhos rodando o vestido verde-água ao entardecer",
        position: "50% 18%",
        width: 1267,
        height: 1900,
      },
      {
        src: "/images/reino/ariel-close.jpg",
        alt: "Retrato da princesa do mar sorrindo, cabelos ruivos ao sol",
        position: "50% 30%",
        width: 1000,
        height: 1500,
      },
    ],
  },
  {
    slug: "princesa-da-torre",
    name: "Princesa da Torre",
    worlds: ["reino-encantado"],
    blurb: "Setenta palmos de trança, flores no cabelo e uma vontade enorme de festa.",
    story:
      "Passou a vida inteira olhando o mundo pela janela de uma torre, e agora quer viver cada minuto do lado de fora. Sua trança dourada é longa o bastante para enfeitar a sala toda, e cada flor nela guarda um pedido de aniversário. Ela chega perguntando: qual é o seu sonho hoje?",
    emblem: "torre",
    photos: [
      {
        src: "/images/reino/neve-e-torre-dupla.jpg",
        alt: "Princesa da Torre ao lado da Princesa da Neve, as duas surpresas, no jardim ao fim da tarde",
        position: "70% 22%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/reino/rapunzel-corpo.jpg",
        alt: "Princesa da torre segurando a longa trança florida no jardim",
        position: "50% 16%",
        width: 1267,
        height: 1900,
      },
      {
        src: "/images/reino/rapunzel-retrato.jpg",
        alt: "Retrato da princesa da torre com coroa e flores na trança",
        position: "50% 20%",
        width: 1133,
        height: 1700,
      },
    ],
  },
  {
    slug: "princesa-da-neve",
    name: "Princesa da Neve",
    worlds: ["reino-encantado"],
    blurb: "A mais doce das visitas, dizem que os passarinhos a seguem até aqui.",
    story:
      "De coração tão gentil que os bichos da floresta a acompanham por onde vai, ela é a mais meiga das princesas. Canta baixinho, ensina a arrumar a casa dançando e trata cada criança como se fosse da família. Quando sorri, parece que até o inverno derrete um pouquinho.",
    emblem: "coroa",
    photos: [
      {
        src: "/images/reino/neve-close.jpg",
        alt: "Retrato da Princesa da Neve com laço vermelho no cabelo e capa vermelha, ao fim da tarde",
        position: "50% 18%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/reino/neve-corpo.jpg",
        alt: "Princesa da Neve de corpo inteiro, segurando a saia amarela sob as árvores do jardim",
        position: "50% 24%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/reino/neve-sentada.jpg",
        alt: "Princesa da Neve sentada no jardim com a capa vermelha estendida, olhando ao longe",
        position: "50% 26%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/reino/neve-torre-jardim.jpg",
        alt: "Princesa da Neve com a mão no rosto ao lado da Princesa da Torre, no jardim ao fim da tarde",
        position: "35% 22%",
        width: 1067,
        height: 1600,
      },
    ],
  },
  {
    slug: "bela-adormecida",
    name: "Bela Adormecida",
    worlds: ["reino-encantado"],
    blurb: "Acorda de um sono de cem anos só para não perder o parabéns.",
    story:
      "Dizem que um feitiço a fez dormir por cem anos, mas ela jura que acordou só para chegar à sua festa a tempo. Roda o vestido como quem dança num baile de sonho e conta segredos das fadas que cuidaram dela. Com ela por perto, todo desejo soprado na vela vira promessa.",
    emblem: "rosa",
    photos: [
      {
        src: "/images/reino/aurora-corpo.jpg",
        alt: "Princesa de vestido rosa e coroa dourada rodando o vestido no jardim ao pôr do sol",
        position: "50% 22%",
        width: 1267,
        height: 1900,
      },
      {
        src: "/images/reino/aurora-close.jpg",
        alt: "Retrato da princesa loira de coroa dourada sorrindo",
        position: "50% 30%",
        width: 1000,
        height: 1500,
      },
    ],
  },
  {
    slug: "princesa-do-deserto",
    name: "Princesa do Deserto",
    worlds: ["reino-encantado"],
    blurb: "Chega de tapete voador, ou quase, com histórias de um mundo ideal.",
    story:
      "Cresceu entre palácios e jardins de um reino distante, mas sonhava mesmo era com liberdade. Chega trazendo histórias de tapetes que voam, desejos que se realizam e um mundo ideal a perder de vista. Corajosa e cheia de opinião, ela mostra às crianças que princesa também escolhe o próprio caminho.",
    emblem: "lampada",
    photos: [
      {
        src: "/images/reino/deserto-dupla.jpg",
        alt: "Princesa do Deserto ao lado do Príncipe do Deserto, que segura a lâmpada mágica",
        position: "70% 24%",
        width: 1200,
        height: 1600,
      },
      {
        src: "/images/reino/jasmine.jpg",
        alt: "Princesa de traje turquesa e dourado com longa trança escura",
        position: "50% 28%",
        width: 956,
        height: 1700,
      },
    ],
  },
  {
    slug: "navegante-dos-mares",
    name: "Navegante dos Mares",
    worlds: ["reino-encantado", "herois-aventuras"],
    blurb: "O oceano a chamou, mas foi a sua festa que ela escolheu.",
    story:
      "O mar sussurrou seu nome e ela cruzou o oceano inteiro atrás de uma aventura. Destemida, de coroa de flores e coração de exploradora, ensina que a gente sempre sabe o caminho de volta para casa. Na sua festa, cada criança vira parte da tripulação.",
    emblem: "onda",
    photos: [
      {
        src: "/images/momentos/moana-vela.jpg",
        alt: "Navegante dos mares com coroa de flores ao lado de uma menina soprando a vela",
        position: "24% 35%",
        width: 1275,
        height: 1700,
      },
    ],
  },
  {
    slug: "princesa-do-baile",
    name: "Princesa do Baile",
    worlds: ["reino-encantado"],
    blurb: "Sapatinho de cristal e a promessa de dançar até a meia-noite.",
    story:
      "Da cinza do fogão ao salão de baile, ela provou que bondade e um pouquinho de magia mudam qualquer história. Chega de vestido reluzente e sapatinho de cristal, pronta para rodopiar com a aniversariante. E promete: nesta festa, a meia-noite pode esperar.",
    emblem: "coroa",
    photos: [
      {
        src: "/images/reino/princesa-baile.jpg",
        alt: "Princesa do Baile de vestido azul e luvas, diante da decoração de castelo da festa",
        position: "50% 25%",
        width: 910,
        height: 1600,
      },
    ],
  },
  {
    slug: "arqueira-valente",
    name: "Arqueira Valente",
    worlds: ["reino-encantado", "herois-aventuras"],
    blurb: "Cabelos de fogo e pontaria certeira para o alvo mais difícil: gargalhadas.",
    story:
      "Cabelos vermelhos indomáveis e um arco sempre a postos, ela escreve o próprio destino a cada flecha. Corajosa e brincalhona, prefere subir em árvores a esperar num castelo. Seu alvo favorito? Acertar em cheio o riso de cada criança.",
    emblem: "arco",
    photos: [
      {
        src: "/images/reino/arqueira-valente.jpg",
        alt: "Arqueira Valente de cabelo ruivo cacheado e vestido azul-petróleo, com o arco ao lado",
        position: "50% 30%",
        width: 1446,
        height: 1066,
      },
    ],
  },
  {
    slug: "fada-madrinha",
    name: "Fada Madrinha",
    worlds: ["reino-encantado"],
    blurb: "Uma varinha, um pedido e a certeza de que ainda dá tempo.",
    story:
      "Ela aparece quando a esperança já estava quase no fim, e transforma o que tem à mão em algo que ninguém esperava: abóbora vira carruagem, pano velho vira vestido de baile. Na sua festa, chega para lembrar a aniversariante de que todo desejo merece uma chance — e que a magia costuma vir de quem menos se espera.",
    emblem: "estrela",
    photos: [
      {
        src: "/images/reino/fada-madrinha.jpg",
        alt: "Fada Madrinha de capa azul, com varinha e a carruagem dourada nas mãos",
        position: "50% 30%",
        width: 1247,
        height: 1600,
      },
    ],
  },
  {
    slug: "bela-e-a-fera",
    name: "Bela e a Fera",
    worlds: ["reino-encantado"],
    blurb: "Um convite para jantar, e para descobrir que a fera dança valsa.",
    story:
      "Ela viu além das aparências e descobriu um coração gentil onde todos só enxergavam um monstro. Juntos, provam que o que importa mora por dentro, e que até a fera mais brava sabe dançar uma valsa. Chegam de mãos dadas, trazendo uma rosa encantada e uma lição de carinho.",
    emblem: "rosa",
    photos: [
      {
        src: "/images/reino/bela-e-fera-real.jpg",
        alt: "Bela de vestido amarelo ao lado da Fera de casaco azul, de braços dados numa festa",
        position: "50% 24%",
        width: 900,
        height: 1600,
      },
    ],
  },
  {
    slug: "bruxa-do-mar",
    name: "Bruxa do Mar",
    worlds: ["reino-encantado", "datas-magicas"],
    blurb: "A vilã favorita aceita o convite. Pobres almas infelizes: vai ter show.",
    story:
      "Poderosa, teatral e absolutamente inesquecível, a vilã dos mares faz uma entrada digna de espetáculo. Vem barganhar desejos e roubar a cena com aquela risada que dá um delicioso arrepio. Pode não ser mocinha, mas é, disparado, a mais divertida da festa.",
    emblem: "tridente",
    photos: [
      {
        src: "/images/reino/bruxa-mar-retrato.jpg",
        alt: "Bruxa do Mar em close: cabelo branco armado, sombra verde-água e batom vermelho",
        position: "50% 25%",
        width: 884,
        height: 1222,
      },
      {
        src: "/images/reino/bruxa-mar-corpo.jpg",
        alt: "Bruxa do Mar de vestido preto, com os tentáculos roxos abertos ao redor",
        position: "50% 25%",
        width: 1028,
        height: 1314,
      },
      {
        src: "/images/reino/bruxa-mar-fantasia.jpg",
        alt: "Detalhe da fantasia: o vestido de veludo preto e os tentáculos roxos com ventosas",
        position: "50% 50%",
        width: 924,
        height: 1238,
      },
    ],
  },

  {
    slug: "principe-do-deserto",
    name: "Príncipe do Deserto",
    worlds: ["reino-encantado"],
    blurb: "Chegou de tapete, trouxe a lâmpada e promete um desejo por criança.",
    story:
      "Cresceu correndo pelos becos do mercado e aprendeu que coragem não tem a ver com ouro. Traz a lâmpada dourada debaixo do braço e uma reverência ensaiada que nunca sai como devia. Deixa cada criança esfregar a lâmpada e pedir um desejo em voz alta — e faz questão de anotar todos, porque diz que gênio esquecido é gênio desempregado.",
    emblem: "lampada",
    photos: [
      {
        src: "/images/reino/principe-deserto.jpg",
        alt: "Príncipe do Deserto de turbante branco com pluma rosa, segurando a lâmpada dourada",
        position: "50% 22%",
        width: 1200,
        height: 1600,
      },
      {
        src: "/images/reino/deserto-dupla.jpg",
        alt: "Príncipe do Deserto ao lado da Princesa do Deserto numa festa",
        position: "30% 24%",
        width: 1200,
        height: 1600,
      },
    ],
  },

  // ——— Heróis & Aventuras ———
  {
    slug: "heroi-aranha",
    name: "Heróis Aranha",
    worlds: ["herois-aventuras"],
    blurb: "Aparecem de surpresa, do aranhaverso inteiro, provavelmente pelo ponto mais alto da casa.",
    story:
      "Vindos de mundos paralelos, os heróis aranha se encontram numa missão só: fazer a sua festa inesquecível. Chegam de surpresa, quase sempre pelo ponto mais alto da sala, com teias, piruetas e aquele bordão que toda criança sabe de cor. Com grandes poderes vêm grandes brincadeiras.",
    emblem: "aranha",
    photos: [
      {
        src: "/images/herois/homem-aranha.jpg",
        alt: "Trio de heróis aranha: Gwen, Miles e o clássico, lado a lado na festa",
        position: "50% 40%",
        width: 921,
        height: 1600,
      },
    ],
  },
  {
    slug: "time-de-herois",
    name: "Time de Heróis",
    worlds: ["herois-aventuras"],
    blurb: "O escudo, a armadura e a teia — os três na mesma festa.",
    story:
      "Quando a ameaça é grande demais para um só, eles aparecem juntos. Um traz o escudo que nunca falha, outro a armadura que voa, o terceiro a teia que resolve o resto. Chegam em formação, tiram foto com cada convidado e saem deixando a criançada convencida de que também faz parte do time.",
    emblem: "raio",
    photos: [
      {
        src: "/images/herois/time-de-herois.jpg",
        alt: "Três heróis lado a lado numa festa: um de escudo, um de armadura vermelha e dourada e um de teia",
        position: "50% 35%",
        width: 1233,
        height: 1600,
      },
    ],
  },
  {
    slug: "cavaleiro-das-sombras",
    name: "Cavaleiro das Sombras",
    worlds: ["herois-aventuras"],
    blurb: "Sério como manda o figurino, até a primeira criança pedir colo.",
    story:
      "Guardião silencioso da cidade, ele surge das sombras com capa, armadura e voz grave de herói. Faz a pose séria que o figurino manda… até a primeira criança pedir colo e derreter todo aquele mistério. Por baixo da máscara, mora o defensor mais gentil da festa.",
    emblem: "morcego",
    photos: [
      {
        src: "/images/herois/cavaleiro-sombras.jpg",
        alt: "Cavaleiro das Sombras de máscara e armadura, num salão de festa",
        position: "25% 35%",
        width: 710,
        height: 1170,
      },
    ],
  },
  {
    slug: "herois-do-pijama",
    name: "Heróis do Pijama",
    worlds: ["herois-aventuras", "diversao-desenhos"],
    blurb: "À noite, salvam o dia. De dia, salvam a festa.",
    story:
      "Quando a noite chega, três amiguinhos vestem seus pijamas mágicos e viram super-heróis. Ágeis, corajosos e do tamanho da criançada, eles resolvem qualquer perrengue com trabalho em equipe. Na sua festa, todo pequeno vira herói junto com eles.",
    emblem: "lua",
    photos: [
      {
        src: "/images/herois/herois-pijama.jpg",
        alt: "Os heróis de pijama enfileirados num jardim, ao fim da tarde",
        position: "50% 40%",
        width: 1303,
        height: 1600,
      },
    ],
  },

  // ——— Mundo dos Mascotes ———
  {
    slug: "cachorrinhas-irmas",
    name: "Cachorrinhas Irmãs",
    worlds: ["mundo-dos-mascotes", "diversao-desenhos"],
    blurb: "A dupla mais amada da TV, em tamanho de abraço apertado.",
    story:
      "As irmãs mais brincalhonas da televisão saltam da telinha em tamanho de abraço apertado. Uma inventa a brincadeira, a outra topa na hora, e juntas transformam a sala numa aventura de faz de conta. É impossível não sair correndo atrás delas.",
    emblem: "patinha",
    photos: [
      {
        src: "/images/mascotes/bluey-bingo.jpg",
        alt: "Mascotes das cachorrinhas azul e caramelo de mãos dadas na festa",
        position: "50% 30%",
        width: 1320,
        height: 1300,
      },
    ],
  },
  {
    slug: "patrulha-dos-filhotes",
    name: "Patrulha dos Filhotes",
    worlds: ["mundo-dos-mascotes", "diversao-desenhos"],
    blurb: "Seis filhotes, um chamado e a festa inteira sob controle.",
    story:
      "Cada um tem seu capacete, sua missão e sua teimosia: o do fogo, o da polícia, o do mergulho, o da reciclagem. Chegam juntos, em formação, e transformam qualquer bagunça em operação de resgate. Na sua festa a missão é só uma, e eles levam a sério: fazer a criançada rir até cansar.",
    emblem: "patinha",
    photos: [
      {
        src: "/images/mascotes/patrulha-filhotes.jpg",
        alt: "Seis mascotes filhotes de capacete colorido posando com o menino da patrulha numa festa",
        position: "50% 40%",
        width: 1600,
        height: 1382,
      },
    ],
  },
  {
    slug: "familia-tubarao",
    name: "Família Tubarão",
    worlds: ["mundo-dos-mascotes"],
    blurb: "Doo doo doo doo doo doo, a família inteira chega dançando.",
    story:
      "A família mais grudenta do fundo do mar chega cantando aquela musiquinha que ninguém consegue tirar da cabeça. Papai, mamãe e o filhotinho vêm com coreografia pronta para a criançada imitar. Doo doo doo doo, e a festa inteira entra no ritmo.",
    emblem: "onda",
    photos: [
      {
        src: "/images/mascotes/baby-shark.jpg",
        alt: "Cinco mascotes coloridos da família tubarão em frente à entrada da festa",
        position: "50% 40%",
        width: 1320,
        height: 651,
      },
    ],
  },
  {
    slug: "alien-azul-e-angel",
    name: "Alienzinho Azul & Angel",
    worlds: ["mundo-dos-mascotes", "diversao-desenhos"],
    blurb: "Ohana quer dizer família, e família quer dizer dançar junto na festa.",
    story:
      "Um pequeno alienígena azul e sua companheira rosa aprenderam que ohana quer dizer família, e família ninguém deixa para trás. Levados na medida certa, adoram uma bagunça boa e um abraço apertado. Chegam para lembrar que os amigos mais diferentes são os mais queridos.",
    emblem: "estrela",
    photos: [
      {
        src: "/images/mascotes/stitch-angel.jpg",
        alt: "Mascotes do alienzinho azul e da alienzinha rosa dançando",
        position: "50% 45%",
        width: 1320,
        height: 1000,
      },
    ],
  },
  {
    slug: "casal-de-ratinhos",
    name: "Casal de Ratinhos",
    worlds: ["mundo-dos-mascotes", "datas-magicas"],
    blurb: "Os anfitriões mais famosos do mundo, de laço e luvas brancas — e de fantasia em outubro.",
    story:
      "De luvas brancas e sorriso enorme, o casalzinho mais famoso do mundo veio dar as boas-vindas. Ele com suas orelhas redondas, ela com o laço perfeito, juntos, são a definição de festa feliz. Chegam para receber cada convidado como um velho amigo. E quando outubro chega, trocam o laço pela fantasia e saem atrás de gostosuras, com uma pitada de susto do tamanho certo, só o suficiente para arrancar risadas.",
    emblem: "orelhas",
    photos: [
      {
        src: "/images/datas-magicas/ratinhos-halloween-real.jpg",
        alt: "Casal de ratinhos fantasiado para o Halloween diante de um arco de balões laranja e roxo",
        position: "50% 30%",
        width: 960,
        height: 1280,
      },
    ],
  },

  // ——— Pop & K-Pop ———
  {
    slug: "guerreiras-do-kpop",
    name: "Guerreiras do K-Pop",
    worlds: ["pop-kpop"],
    blurb: "Três vozes, uma coreografia, e a plateia mais importante da carreira delas.",
    story:
      "De dia, ídolas do pop com hits que lotam estádios; de noite, guerreiras que protegem o mundo com música. Chegam com coreografia afiada, figurinos brilhantes e energia de show de arena. E fazem questão de ensinar cada passo para a maior fã da festa.",
    emblem: "estrela",
    photos: [
      {
        src: "/images/pop/kpop-com-crianca.jpg",
        alt: "As três do K-Pop abraçadas com uma criança, diante do painel colorido da festa",
        position: "50% 30%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/pop/guerreira-tranca.jpg",
        alt: "Guerreira do k-pop de trança roxa e jaqueta amarela",
        position: "50% 18%",
        width: 1066,
        height: 1600,
      },
      {
        src: "/images/pop/guerreira-preta.jpg",
        alt: "Guerreira do k-pop de cabelo preto fazendo coração com os dedos",
        position: "50% 15%",
        width: 1067,
        height: 1600,
      },
      {
        src: "/images/pop/guerreira-roxa.jpg",
        alt: "Guerreira do k-pop de cabelo roxo no cenário Guerreiras do K-Pop",
        position: "50% 12%",
        width: 1200,
        height: 1600,
      },
    ],
  },

  // ——— Diversão & Desenhos ———
  {
    slug: "carreta-da-alegria",
    name: "Carreta da Alegria",
    worlds: ["diversao-desenhos", "brasil-encantado"],
    blurb: "Chegou a hora de todo mundo dançar, e ninguém escapa.",
    story:
      "É a farra sobre rodas que todo mundo reconhece pela batida antes mesmo de ver. O coelho, o guerreiro e o de cabelo vermelho descem juntos, e a coreografia começa antes de alguém pedir. Não existe plateia: em cinco minutos está todo mundo no meio da roda, inclusive os adultos que juraram que não iam dançar.",
    emblem: "raio",
    photos: [
      {
        src: "/images/diversao/carreta-alegria.jpg",
        alt: "O trio da carreta — o coelho, o guerreiro de laranja e o de cabelo vermelho — diante do painel iluminado",
        position: "50% 35%",
        width: 1024,
        height: 1536,
      },
    ],
  },
  {
    slug: "gabby-e-amigos",
    name: "Gabby e Amigos",
    worlds: ["diversao-desenhos"],
    blurb: "Miau-ravilhoso: a casa de bonecas abre as portas na sua festa.",
    story:
      "Ela tem a chave de uma casa de bonecas cheia de gatinhos mágicos e criatividade sem fim. Cada cômodo é uma surpresa, cada amiguinho felpudo tem um talento. Miau-ravilhoso é a palavra, e a imaginação, o único limite.",
    emblem: "gato",
    photos: [
      {
        src: "/images/diversao/gabby-amigos.jpg",
        alt: "Os dois gatinhos da casa de bonecas, o azul e a branca de bolsinha rosa, acenando",
        position: "50% 35%",
        width: 1306,
        height: 1600,
      },
    ],
  },

  // ——— Datas Mágicas ———
  {
    slug: "turma-junina",
    name: "Turma Junina",
    worlds: ["datas-magicas", "brasil-encantado"],
    blurb: "O chapéu de palha, o couro do cangaço e a espiga de milho — os três no mesmo arraiá.",
    story:
      "Quando junho chega, eles descem juntos para o mesmo arraiá: o Chico Bento e a Rosinha, direto da rocinha; a Maria Bonita e o cangaceiro, de chapéu de couro; e o Milhinho Junino, o mascote que puxa a quadrilha. Trazem bandeirinha, dança de roda e aquela alegria de festa junina de rua. Anarriê! Todo mundo de mãos dadas para o forró começar.",
    emblem: "fogueira",
    members: ["casal-da-roca", "maria-bonita-e-cangaceiro", "milhinho-junino"],
    /*
      A primeira é o grupo inteiro, e é `wide`: com 1,50 de proporção, a moldura
      retrato do palco guardaria só 47% da largura e o Chico Bento sumiria. As
      outras três mostram cada ato sozinho e preenchem a grade da galeria.
    */
    photos: [
      {
        src: "/images/brasil/turma-junina.jpg",
        alt: "A turma junina reunida no arraiá: o Chico Bento, a Maria Bonita, o Milhinho Junino e o cangaceiro, entre girassóis e bandeirinhas",
        position: "50% 50%",
        wide: true,
        width: 1536,
        height: 1024,
      },
      {
        src: "/images/brasil/milhinho-junino.jpg",
        alt: "O Milhinho Junino, um dos três da turma, no arraiá com bandeirinhas e a placa Viva São João",
        position: "50% 35%",
        width: 1106,
        height: 1422,
      },
      {
        src: "/images/brasil/casal-roca.jpg",
        alt: "O Chico Bento e a Rosinha, outros dois da turma, com duas crianças numa festa junina ao ar livre",
        position: "50% 35%",
        width: 1322,
        height: 1198,
      },
      {
        src: "/images/brasil/maria-bonita-casal.jpg",
        alt: "A Maria Bonita e o cangaceiro, que fecham a turma, de chapéu de couro e cartucheira",
        position: "50% 8%",
        width: 1024,
        height: 1536,
      },
    ],
  },
  {
    slug: "natal-encantado",
    name: "Natal Encantado",
    worlds: ["datas-magicas"],
    blurb: "Dezembro chega mais cedo quando a magia bate na porta.",
    story:
      "Quando os primeiros pisca-piscas acendem, a magia do Natal bate à porta antes da hora. Vem com sinos, histórias de neve e aquele espírito de dezembro que faz todo mundo querer abraçar. Um presente vivo para a festa mais aconchegante do ano.",
    emblem: "presente",
    photos: [],
  },

  {
    slug: "noiva-do-outro-mundo",
    name: "Noiva do Outro Mundo",
    worlds: ["datas-magicas"],
    blurb: "Esperou tanto pelo casamento que atravessou para o outro lado — e voltou de buquê na mão.",
    story:
      "Tem a pele azul da lua e um véu que arrasta folhas por onde passa. Dizem que ficou anos esperando um noivo que não veio, e que desistiu de esperar para ir dançar. Chega no Halloween com o buquê de sempre e uma minhoquinha falante no ombro, que conta as piadas que ela é tímida demais para contar. Ensina as crianças a fazer a reverência mais elegante do cemitério.",
    emblem: "lua",
    photos: [
      {
        src: "/images/datas-magicas/noiva-outro-mundo.jpg",
        alt: "Noiva do Outro Mundo de pele azul e véu, segurando um buquê de rosas brancas",
        position: "50% 20%",
        width: 1206,
        height: 1551,
      },
      {
        src: "/images/datas-magicas/noiva-outro-mundo-2.jpg",
        alt: "Noiva do Outro Mundo ao ar livre à noite, com a minhoquinha verde no ombro",
        position: "50% 22%",
        width: 1058,
        height: 1447,
      },
    ],
  },
  {
    slug: "rei-da-abobora",
    name: "Rei da Abóbora & Boneca de Retalhos",
    worlds: ["datas-magicas"],
    blurb: "Ele manda no Halloween. Ela costura o resto. Em dezembro, os dois trocam de roupa.",
    story:
      "Ele é magro feito um galho, usa terno de riscas e acha que já viu tudo — até descobrir o Natal e resolver assumir o trenó no susto. Ela costura as próprias roupas de retalho e é quem lembra o que ele esquece. Chegam juntos, contam como é a cidade onde moram e ensinam as crianças a rir do que assusta. Atendem tanto festa de Halloween quanto de Natal, com o mesmo par e figurinos diferentes.",
    emblem: "abobora",
    photos: [
      {
        src: "/images/datas-magicas/rei-abobora-boneca.jpg",
        alt: "Rei da Abóbora de terno listrado ao lado da Boneca de Retalhos, ao ar livre",
        position: "50% 20%",
        width: 975,
        height: 1300,
      },
      {
        src: "/images/datas-magicas/rei-abobora-natal.jpg",
        alt: "Rei da Abóbora e a Boneca de Retalhos vestidos de vermelho para o Natal",
        position: "50% 24%",
        width: 864,
        height: 1101,
      },
    ],
  },

  // ——— Brasil Encantado ———
  {
    slug: "turma-do-bairro",
    name: "Turma do Bairro",
    worlds: ["brasil-encantado", "diversao-desenhos"],
    blurb: "A rua mais famosa dos quadrinhos brasileiros vem inteira para o seu quintal.",
    story:
      "São quatro amigos e um coelho azul que não desgruda dela. Brigam, fazem as pazes e inventam brincadeira com o que estiver por perto — que é exatamente o que toda criança faz. Chegam com o jeito de quem cresceu em rua de bairro, e transformam a festa num daqueles dias de brincar até a mãe chamar para jantar.",
    emblem: "estrela",
    photos: [
      {
        src: "/images/brasil/turma-bairro.jpg",
        alt: "O quarteto dos quadrinhos brasileiros no jardim, com o coelho azul",
        position: "50% 30%",
        width: 920,
        height: 1600,
      },
    ],
  },
  {
    slug: "maria-bonita-e-cangaceiro",
    name: "Maria Bonita & Cangaceiro",
    worlds: ["brasil-encantado"],
    blurb: "Do sertão para o salão, com chapéu de couro e coragem de sobra.",
    story:
      "Vindos direto do sertão, o casal mais valente do cangaço traz couro, coragem e muita história de aventura. Ela, dona do próprio destino; ele, guardião de um coração corajoso. Juntos, mostram às crianças um pedaço encantado da nossa terra.",
    emblem: "chapeu",
    photos: [
      {
        src: "/images/brasil/maria-bonita-casal.jpg",
        alt: "Maria Bonita e o cangaceiro de chapéu de couro e cartucheira, sorrindo num cenário nordestino",
        position: "50% 8%",
        width: 1024,
        height: 1536,
      },
      {
        src: "/images/brasil/cangaco-figurinos.jpg",
        alt: "Os dois figurinos do cangaço lado a lado: chapéus de couro com estrelas e medalhas, cartucheiras e saia de chita",
        position: "50% 0%",
        width: 1079,
        height: 1457,
      },
      {
        src: "/images/brasil/maria-bonita-figurino.jpg",
        alt: "O figurino de Maria Bonita em detalhe: saia de chita com babados, renda e girassóis",
        position: "50% 0%",
        width: 1079,
        height: 1457,
      },
      {
        src: "/images/brasil/cangaceiro-figurino.jpg",
        alt: "O figurino do cangaceiro em detalhe: colete, cartucheira cruzada e calça com bordado de fogo",
        position: "50% 0%",
        width: 1024,
        height: 1536,
      },
    ],
  },
  {
    // O slug continua "casal-da-roca" de propósito: o endereço já está no ar e
    // trocá-lo quebraria quem tem o link. Nome e slug já divergem em outros seis
    // personagens, então isto não é exceção.
    slug: "casal-da-roca",
    name: "Chico Bento e Rosinha",
    worlds: ["brasil-encantado"],
    blurb: "Direto da rocinha, o casal mais querido dos quadrinhos brasileiros.",
    story:
      "Descalços na rocinha e com o coração do tamanho do Brasil, o casalzinho mais querido dos quadrinhos chega para brincar. Trazem causos da vida no campo, pescaria e aquele jeitinho simples de ser feliz. Pura brasilidade, do chapéu de palha ao sorriso banguela.",
    emblem: "chapeu",
    photos: [
      {
        src: "/images/brasil/casal-roca.jpg",
        alt: "Chico Bento e Rosinha, em boneco, posando com duas crianças numa festa junina ao ar livre",
        position: "50% 35%",
        width: 1322,
        height: 1198,
      },
    ],
  },
  {
    slug: "milhinho-junino",
    name: "Milhinho Junino",
    worlds: ["brasil-encantado", "datas-magicas"],
    blurb: "O mascote da quermesse que faz todo mundo dançar quadrilha.",
    story:
      "O mascote mais fofo da quermesse chegou espigando alegria por todo canto. Fofo, quicando e sempre pronto para a dança, ele puxa a criançada para o meio do arraiá. Com ele por perto, ninguém fica parado, nem o milho na panela.",
    emblem: "milho",
    photos: [
      {
        src: "/images/brasil/milhinho-junino.jpg",
        alt: "Milhinho Junino, o mascote espiga de milho, no arraiá com bandeirinhas e fardos de feno",
        position: "50% 35%",
        width: 1106,
        height: 1422,
      },
    ],
  },
];

export const visibleCharacters = characters.filter((c) => !c.hidden);

export const charactersOfWorld = (worldSlug: string) =>
  visibleCharacters.filter((c) => c.worlds.includes(worldSlug));

export const characterBySlug = (slug: string) =>
  visibleCharacters.find((c) => c.slug === slug);
