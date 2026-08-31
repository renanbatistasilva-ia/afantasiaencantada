import Image from "next/image";
import type { Character, EmblemKey } from "@/data/types";
import { worldBySlug } from "@/data/worlds";
import { EMBLEMS } from "./emblems";
import styles from "./CharacterMedallion.module.css";

interface Props {
  character: Character;
  size?: number;
  /** Prioridade de carregamento da foto (para o 1º da lista) */
  priority?: boolean;
  className?: string;
}

/** Emblema padrão quando o personagem não define — derivado do 1º mundo. */
const WORLD_DEFAULT_EMBLEM: Record<string, EmblemKey> = {
  "reino-encantado": "coroa",
  "herois-aventuras": "morcego",
  "mundo-dos-mascotes": "patinha",
  "pop-kpop": "estrela",
  "diversao-desenhos": "gato",
  "datas-magicas": "lua",
  "brasil-encantado": "chapeu",
};

/**
 * Retrato circular do personagem. Com foto → mostra a foto.
 * Sem foto → medalhão ilustrado com as cores do mundo, um símbolo
 * temático e a inicial em caligrafia dourada. Determinístico.
 */
export default function CharacterMedallion({
  character,
  size = 44,
  priority = false,
  className,
}: Props) {
  const photo = character.photos[0];

  if (photo) {
    return (
      <span
        className={`${styles.medallion} ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={photo.src}
          alt=""
          fill
          sizes={`${size}px`}
          priority={priority}
          style={{ objectFit: "cover", objectPosition: photo.position ?? "50% 20%" }}
        />
      </span>
    );
  }

  const world = worldBySlug(character.worlds[0]);
  const accent = world?.atmosphere.accent ?? "#c29553";
  const glow = world?.atmosphere.glow ?? "#e9ce9c";
  const ink = world?.atmosphere.ink ?? "#43303b";
  const emblem = character.emblem ?? WORLD_DEFAULT_EMBLEM[character.worlds[0]] ?? "estrela";
  const initial = character.name.trim().charAt(0).toUpperCase();

  return (
    <span
      className={`${styles.medallion} ${styles.illustrated} ${className ?? ""}`}
      style={
        {
          width: size,
          height: size,
          "--m-accent": accent,
          "--m-glow": glow,
          "--m-ink": ink,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        className={styles.emblem}
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {EMBLEMS[emblem] ?? EMBLEMS.estrela}
      </svg>
      <span className={`script ${styles.initial}`} style={{ fontSize: size * 0.5 }}>
        {initial}
      </span>
    </span>
  );
}
