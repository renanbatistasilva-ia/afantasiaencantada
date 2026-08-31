import type { World } from "./types";

export const worlds: World[] = [
  {
    slug: "reino-encantado",
    name: "Reino Encantado",
    tagline: "Onde as princesas descem do castelo para dançar na sua sala.",
    invite: "Vestidos que rodam, coroas que brilham e vozes que cantam pertinho.",
    atmosphere: {
      bg: "linear-gradient(175deg, #f9e6e3 0%, #f4d6d2 55%, #eec9c9 100%)",
      ink: "#4a2f38",
      accent: "#a44e68",
      glow: "#e9ce9c",
      mood: "day",
    },
    cover: {
      src: "/images/reino/ariel-danca.jpg",
      alt: "Princesa do mar dançando com vestido verde-água ao pôr do sol",
      position: "50% 16%",
    },
    order: 1,
  },
  {
    slug: "herois-aventuras",
    name: "Heróis & Aventuras",
    tagline: "Para crianças que atendem pelo nome de coragem.",
    invite: "Teias, capas e missões secretas que invadem a festa.",
    atmosphere: {
      bg: "linear-gradient(170deg, #1c2440 0%, #2a1c4e 70%, #38204a 100%)",
      ink: "#f3ecff",
      accent: "#e4574d",
      glow: "#7fb3ff",
      mood: "night",
    },
    cover: {
      src: "/images/herois/homem-aranha.jpg",
      alt: "Trio de heróis aranha lado a lado na festa",
      position: "50% 38%",
    },
    order: 2,
  },
  {
    slug: "mundo-dos-mascotes",
    name: "Mundo dos Mascotes",
    tagline: "Fofura em tamanho gigante, feita para abraçar.",
    invite: "Os personagens favoritos da TV, grandes o bastante para um abraço de verdade.",
    atmosphere: {
      bg: "linear-gradient(175deg, #e2f0f7 0%, #f4ecda 60%, #fdeed3 100%)",
      ink: "#2f4358",
      accent: "#2e7db2",
      glow: "#ffd989",
      mood: "day",
    },
    cover: {
      src: "/images/mascotes/bluey-bingo.jpg",
      alt: "Mascotes de cachorrinhos azul e caramelo acenando na festa",
      position: "50% 30%",
    },
    order: 3,
  },
  {
    slug: "pop-kpop",
    name: "Pop & K-Pop",
    tagline: "O palco acende, o refrão explode. E a estrela é a sua filha.",
    invite: "Coreografias, luzes e um show de verdade na altura dos olhos.",
    atmosphere: {
      bg: "linear-gradient(168deg, #2a1038 0%, #451043 60%, #59103a 100%)",
      ink: "#ffe9f4",
      accent: "#ff4f9a",
      glow: "#b26cff",
      mood: "night",
    },
    cover: {
      src: "/images/pop/guerreira-roxa.jpg",
      alt: "Guerreira do k-pop de cabelo roxo no cenário Guerreiras do K-Pop",
      position: "50% 12%",
    },
    order: 4,
  },
  {
    slug: "diversao-desenhos",
    name: "Diversão & Desenhos",
    tagline: "Direto da telinha para o meio da bagunça boa.",
    invite: "Os amigos dos desenhos que fazem os pequenos apontarem: “é ele!”",
    atmosphere: {
      bg: "linear-gradient(175deg, #fde7d8 0%, #f9dbe4 60%, #f3d3ea 100%)",
      ink: "#5a3247",
      accent: "#c4589a",
      glow: "#ffd0a6",
      mood: "festive",
    },
    cover: {
      src: "/images/diversao/mascotes-anime.jpg",
      alt: "Personagem do Goku entre dois mascotes coloridos na festa",
      position: "50% 28%",
    },
    order: 5,
  },
  {
    slug: "datas-magicas",
    name: "Datas Mágicas",
    tagline: "Cada estação tem seu próprio feitiço.",
    invite: "Halloween, festa junina, Natal: a magia troca de fantasia com o calendário.",
    atmosphere: {
      bg: "linear-gradient(170deg, #201426 0%, #33182b 60%, #3a1e2c 100%)",
      ink: "#f7e8d8",
      accent: "#d98a3d",
      glow: "#f1c97e",
      mood: "night",
    },
    order: 6,
  },
  {
    slug: "brasil-encantado",
    name: "Brasil Encantado",
    tagline: "A magia também fala com sotaque daqui.",
    invite: "Cangaço, roça e quermesse: personagens da nossa terra em festa.",
    atmosphere: {
      bg: "linear-gradient(175deg, #f9ebd2 0%, #f6dfb8 60%, #f3d9b0 100%)",
      ink: "#5c3a22",
      accent: "#b0562f",
      glow: "#7fa65a",
      mood: "festive",
    },
    order: 7,
  },
];

export const visibleWorlds = worlds
  .filter((w) => !w.hidden)
  .sort((a, b) => a.order - b.order);

export const worldBySlug = (slug: string) =>
  worlds.find((w) => w.slug === slug && !w.hidden);
