/**
 * Modelo de dados espelhando as futuras tabelas do Supabase.
 * Mundos e personagens são flexíveis: um personagem pode habitar
 * vários mundos, e mundos podem ser criados/ocultados só editando
 * estes arquivos — nenhum componente conhece mundos específicos.
 */

export type Mood = "day" | "night" | "festive";

export interface WorldAtmosphere {
  /** Gradiente/cor de fundo do painel do mundo */
  bg: string;
  /** Cor da tinta (texto) sobre esse fundo */
  ink: string;
  /** Cor de acento (ornamentos, CTAs) */
  accent: string;
  /** Cor do brilho/luz ambiente */
  glow: string;
  mood: Mood;
}

export interface World {
  slug: string;
  name: string;
  /** Frase curta que abre o mundo, em tom de conto */
  tagline: string;
  /** Convite mostrado no portal da home */
  invite: string;
  atmosphere: WorldAtmosphere;
  /** Foto de capa do portal (opcional — mundos novos podem não ter) */
  cover?: { src: string; alt: string; position?: string };
  order: number;
  hidden?: boolean;
}

export interface CharacterPhoto {
  src: string;
  alt: string;
  /** object-position para o enquadramento no arco */
  position?: string;
  width: number;
  height: number;
}

/** Símbolo do medalhão ilustrado (para personagens sem foto). */
export type EmblemKey =
  | "coroa"
  | "concha"
  | "torre"
  | "lampada"
  | "onda"
  | "arco"
  | "rosa"
  | "tridente"
  | "aranha"
  | "morcego"
  | "lua"
  | "patinha"
  | "orelhas"
  | "estrela"
  | "gato"
  | "raio"
  | "abobora"
  | "fogueira"
  | "presente"
  | "chapeu"
  | "milho";

export interface Character {
  slug: string;
  name: string;
  /** Slugs dos mundos que este personagem habita (1 ou mais) */
  worlds: string[];
  /** Uma linha de apresentação, na voz do conto */
  blurb: string;
  /** História cativante (2–4 frases) mostrada ao clicar no personagem */
  story: string;
  /** Símbolo do medalhão quando não há foto (default derivado do 1º mundo) */
  emblem?: EmblemKey;
  photos: CharacterPhoto[];
  hidden?: boolean;
}
