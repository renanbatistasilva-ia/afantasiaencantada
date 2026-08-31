"use client";

import { motion, useReducedMotion } from "motion/react";
import styles from "./ChapterMark.module.css";

interface Props {
  numeral: string;
  name: string;
  title: string;
  lede?: string;
  /** Tinta do capítulo (herda do fundo da seção) */
  tone?: "light" | "dark";
}

/**
 * O fio de magia: cada capítulo da jornada é costurado por uma linha
 * dourada que se desenha quando a seção entra em cena.
 */
export default function ChapterMark({ numeral, name, title, lede, tone = "light" }: Props) {
  const reduced = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={`${styles.mark} ${tone === "dark" ? styles.dark : ""}`}>
      <motion.span
        className={styles.thread}
        initial={reduced ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, ease }}
        aria-hidden="true"
      />
      <motion.span
        className={styles.star}
        initial={reduced ? false : { opacity: 0, rotate: -90, scale: 0.4 }}
        whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, delay: 0.5, ease }}
        aria-hidden="true"
      >
        ✦
      </motion.span>
      <motion.p
        className={`script ${styles.chapter}`}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.8, delay: 0.55, ease }}
      >
        Capítulo {numeral} · {name}
      </motion.p>
      <motion.h2
        className={`display ${styles.title}`}
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, delay: 0.65, ease }}
      >
        {title}
      </motion.h2>
      {lede && (
        <motion.p
          className={styles.lede}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, delay: 0.78, ease }}
        >
          {lede}
        </motion.p>
      )}
    </div>
  );
}
