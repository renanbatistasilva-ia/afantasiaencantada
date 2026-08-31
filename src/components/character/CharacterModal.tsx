"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Character } from "@/data/types";
import { worldBySlug } from "@/data/worlds";
import { characterInterestMessage, whatsappUrl } from "@/lib/whatsapp";
import CharacterMedallion from "./CharacterMedallion";
import styles from "./CharacterModal.module.css";

interface Props {
  character: Character | null;
  onClose: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

/** Cartão de história do personagem — retrato + história + CTA de reserva. */
export default function CharacterModal({ character, onClose }: Props) {
  const reduced = useReducedMotion();
  const open = !!character;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const world = character ? worldBySlug(character.worlds[0]) : undefined;
  const photo = character?.photos[0];

  return (
    <AnimatePresence>
      {character && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={`História de ${character.name}`}
        >
          <motion.div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.5, ease }}
          >
            <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
              ✕
            </button>

            <div className={styles.portrait}>
              {photo ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 22rem"
                  style={{ objectFit: "cover", objectPosition: photo.position ?? "50% 20%" }}
                />
              ) : (
                <div className={styles.portraitEmblem}>
                  <CharacterMedallion character={character} size={150} />
                </div>
              )}
              <span className={styles.portraitVeil} aria-hidden="true" />
            </div>

            <div className={styles.body}>
              {world && <p className={`script ${styles.world}`}>{world.name}</p>}
              <h2 className={`display ${styles.name}`}>{character.name}</h2>
              <p className={styles.story}>{character.story}</p>

              <a
                href={whatsappUrl(characterInterestMessage(character.name))}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-ouro ${styles.cta}`}
              >
                Chamar {character.name} para a festa
              </a>
              <Link
                href={`/reservar?personagem=${character.slug}`}
                className={styles.scheduleLink}
                onClick={onClose}
              >
                Prefiro escolher data e horário
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
