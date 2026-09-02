"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Sparkles from "@/components/fx/Sparkles";
import LiveStage from "@/components/fx/LiveStage";
import styles from "./Hero.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-18%"]);
  const veil = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const show = reduced || entered;

  return (
    <section ref={ref} className={styles.hero} data-scene="sonho">
      <div className={styles.glow} aria-hidden="true" />
      <Sparkles density={1.4} />

      <motion.div className={styles.copy} style={{ y: textY, opacity: veil }}>
        <motion.p
          className={styles.eyebrowLine}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <span className={styles.rule} aria-hidden="true" />
          Personagens vivos · São Paulo
          <span className={styles.rule} aria-hidden="true" />
        </motion.p>

        <motion.h1
          className={`display ${styles.title}`}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          Era uma vez,
          <br />
          <span className={`script ${styles.titleScript}`}>na sua festa.</span>
        </motion.h1>

        <motion.p
          className={styles.sub}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 1, delay: 0.5, ease }}
        >
          Princesas, heróis e mascotes que saem da história e entram pela
          porta para transformar o aniversário do seu filho em um conto
          que ninguém esquece.
        </motion.p>

        <motion.div
          className={styles.actions}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 0.68, ease }}
        >
          <Link href="#mundos" className="btn btn-ouro">
            Começar a história
          </Link>
          <Link href="/reservar" className="btn btn-veu">
            Reservar uma data
          </Link>
        </motion.div>

        <motion.div
          className={styles.socialProof}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 0.85, ease }}
          aria-label="Nossa trajetória"
        >
          <span className={styles.socialProofItem}>
            <span className={styles.socialProofNum}>500+</span> festas encantadas
          </span>
          <span className={styles.socialProofDot} aria-hidden="true" />
          <span className={styles.socialProofItem}>
            <span className={styles.socialProofNum}>8</span> anos de magia
          </span>
          <span className={styles.socialProofDot} aria-hidden="true" />
          <span className={styles.socialProofItem}>
            <span className={styles.socialProofNum}>+200</span> famílias apaixonadas
          </span>
        </motion.div>
      </motion.div>

      <motion.figure
        className={styles.portal}
        animate={show ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 1.05, y: 26 }}
        transition={{ duration: 1.4, delay: 0.35, ease }}
      >
        <LiveStage
          src="/images/reino/rapunzel-hero.jpg"
          alt="Princesa da torre com coroa dourada e trança florida sorrindo ao entardecer"
          position="50% 16%"
          priority
          intensity={1.15}
          glow="233, 206, 156"
          sizes="(max-width: 860px) 92vw, 46vw"
          className={styles.portalStage}
        />
      </motion.figure>

      <motion.div
        className={styles.cue}
        style={{ opacity: veil }}
        aria-hidden="true"
      >
        <span className={styles.cueThread} />
        <span className={styles.cueLabel}>role para abrir o livro</span>
      </motion.div>
    </section>
  );
}
