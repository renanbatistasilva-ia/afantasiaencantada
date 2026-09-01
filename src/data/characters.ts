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
        src: "/images/reino/neve-e-torre.jpg",
        alt: "Princesa da neve com laço vermelho ao lado da princesa da torre no jardim",
        position: "30% 24%",
        width: 1000,
        height: 1500,
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
        alt: "Princesa do baile de vestido azul brilhante na escadaria do castelo com tiara de cristal",
        position: "50% 22%",
        width: 1536,
        height: 1024,
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
        alt: "Arqueira de cabelos vermelhos com arco e flechas na floresta ao pôr do sol, castelo ao fundo",
        position: "42% 20%",
        width: 1536,
        height: 1024,
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
        src: "/images/reino/bela-e-a-fera.jpg",
        alt: "Bela de vestido dourado e a Fera de traje formal posando juntos no salão do castelo encantado",
        position: "50% 22%",
        width: 1536,
        height: 1024,
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
        src: "/images/datas-magicas/bruxa.jpg",
        alt: "Bruxa do Mar com cajado mágico iluminado e vestido roxo e dourado",
        position: "50% 20%",
        width: 490,
        height: 590,
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
    slug: "cavaleiro-das-sombras",
    name: "Cavaleiro das Sombras",
    worlds: ["herois-aventuras"],
    blurb: "Sério como manda o figurino, até a primeira criança pedir colo.",
    story:
      "Guardião silencioso da cidade, ele surge das sombras com capa, armadura e voz grave de herói. Faz a pose séria que o figurino manda… até a primeira criança pedir colo e derreter todo aquele mistério. Por baixo da máscara, mora o defensor mais gentil da festa.",
    emblem: "morcego",
    photos: [],
  },
  {
    slug: "herois-do-pijama",
    name: "Heróis do Pijama",
    worlds: ["herois-aventuras", "diversao-desenhos"],
    blurb: "À noite, salvam o dia. De dia, salvam a festa.",
    story:
      "Quando a noite chega, três amiguinhos vestem seus pijamas mágicos e viram super-heróis. Ágeis, corajosos e do tamanho da criançada, eles resolvem qualquer perrengue com trabalho em equipe. Na sua festa, todo pequeno vira herói junto com eles.",
    emblem: "lua",
    photos: [],
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
    blurb: "Os anfitriões mais famosos do mundo, de laço e luvas brancas.",
    story:
      "De luvas brancas e sorriso enorme, o casalzinho mais famoso do mundo veio dar as boas-vindas. Ele com suas orelhas redondas, ela com o laço perfeito, juntos, são a definição de festa feliz. Chegam para receber cada convidado como um velho amigo.",
    emblem: "orelhas",
    photos: [
      {
        src: "/images/mascotes/ratinhos-casal.jpg",
        alt: "Casal de ratinhos, ela de vestido rosa e ele de terno, sorridentes",
        position: "50% 25%",
        width: 420,
        height: 510,
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
    slug: "turma-anime",
    name: "Goku & a Turma",
    worlds: ["diversao-desenhos", "herois-aventuras"],
    blurb: "O guerreiro mais forte do universo, e amigos fofos, direto dos desenhos.",
    story:
      "Direto dos desenhos mais amados, o guerreiro mais forte do universo pousa na festa com seus amigos mais fofos a tiracolo. Vem cheio de energia, poses de luta e aquele coração gigante que salva o dia. Prepare-se para treinar golpes e dar muita risada.",
    emblem: "raio",
    photos: [
      {
        src: "/images/diversao/mascotes-anime.jpg",
        alt: "Personagem do Goku entre dois mascotes coloridos na festa",
        position: "50% 30%",
        width: 1067,
        height: 1600,
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
    photos: [],
  },

  // ——— Datas Mágicas ———
  {
    slug: "ratinhos-halloween",
    name: "Ratinhos no Halloween",
    worlds: ["datas-magicas"],
    blurb: "Travessuras elegantes e gostosuras dançantes em outubro.",
    story:
      "Quando outubro chega, o casalzinho mais famoso do mundo troca o laço pela fantasia e sai atrás de gostosuras. Trazem uma pitada de susto do tamanho certo, só o suficiente para arrancar risadas. Travessura ou gostosura? Com eles, é sempre festa.",
    emblem: "abobora",
    photos: [
      {
        src: "/images/datas-magicas/ratinhos-halloween.jpg",
        alt: "Crianças caracterizadas de ratinhos em volta de abóboras iluminadas na noite de Halloween",
        position: "50% 28%",
        width: 465,
        height: 530,
      },
    ],
  },
  {
    slug: "turma-junina",
    name: "Turma Junina",
    worlds: ["datas-magicas", "brasil-encantado"],
    blurb: "Quadrilha, bandeirinha e aquele arraiá que ninguém esquece.",
    story:
      "Chapéu de palha, vestido de chita e o pé quentinho para a quadrilha: chegou a turma do arraiá. Trazem bandeirinha, dança de roda e aquela alegria de festa junina de rua. Anarriê! Todo mundo de mãos dadas para o forró começar.",
    emblem: "fogueira",
    photos: [
      {
        src: "/images/datas-magicas/junina.jpg",
        alt: "Grupo da turma junina dançando ao som da sanfona com bandeirinhas coloridas ao fundo",
        position: "50% 30%",
        width: 870,
        height: 534,
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
    photos: [
      {
        src: "/images/datas-magicas/natal.jpg",
        alt: "Casal natalino segurando um globo de neve encantado ao lado da árvore de Natal",
        position: "50% 25%",
        width: 476,
        height: 580,
      },
    ],
  },

  // ——— Brasil Encantado ———
  {
    slug: "maria-bonita-e-cangaceiro",
    name: "Maria Bonita & Cangaceiro",
    worlds: ["brasil-encantado"],
    blurb: "Do sertão para o salão, com chapéu de couro e coragem de sobra.",
    story:
      "Vindos direto do sertão, o casal mais valente do cangaço traz couro, coragem e muita história de aventura. Ela, dona do próprio destino; ele, guardião de um coração corajoso. Juntos, mostram às crianças um pedaço encantado da nossa terra.",
    emblem: "chapeu",
    photos: [],
  },
  {
    slug: "casal-da-roca",
    name: "Casal da Roça",
    worlds: ["brasil-encantado"],
    blurb: "Direto da rocinha, o casal mais querido dos quadrinhos brasileiros.",
    story:
      "Descalços na rocinha e com o coração do tamanho do Brasil, o casalzinho mais querido dos quadrinhos chega para brincar. Trazem causos da vida no campo, pescaria e aquele jeitinho simples de ser feliz. Pura brasilidade, do chapéu de palha ao sorriso banguela.",
    emblem: "chapeu",
    photos: [],
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
        src: "/images/brasil/milhinho.jpg",
        alt: "Milhinho Junino sorridente no meio do milharal com chapéu de palha e espiga de milho",
        position: "50% 30%",
        width: 656,
        height: 330,
      },
    ],
  },
];

export const visibleCharacters = characters.filter((c) => !c.hidden);

export const charactersOfWorld = (worldSlug: string) =>
  visibleCharacters.filter((c) => c.worlds.includes(worldSlug));

export const characterBySlug = (slug: string) =>
  visibleCharacters.find((c) => c.slug === slug);
