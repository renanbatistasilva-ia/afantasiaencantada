"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./CurtainIntro.module.css";

const KEY = "fe_curtain_seen";
const ease = [0.65, 0, 0.35, 1] as const;

/**
 * Abertura teatral: na primeira visita da sessão, uma cortina de poeira
 * dourada se abre revelando o site. Pulável, 1x por sessão, instantânea
 * em reduced-motion. Só roda no cliente após checar o sessionStorage.
 */
export default function CurtainIntro() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen && !reduced) {
      setShow(true);
      document.documentElement.style.overflow = "hidden";
    }
    setReady(true);
  }, [reduced]);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignora */
    }
    document.documentElement.style.overflow = "";
    setShow(false);
  };

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(close, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!ready) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.curtain}
          role="presentation"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`${styles.half} ${styles.left}`}
            initial={{ x: 0 }}
            exit={{ x: "-102%" }}
            transition={{ duration: 1.1, ease, delay: 0.05 }}
          />
          <motion.div
            className={`${styles.half} ${styles.right}`}
            initial={{ x: 0 }}
            exit={{ x: "102%" }}
            transition={{ duration: 1.1, ease, delay: 0.05 }}
          />

          <motion.div
            className={styles.center}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.4 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <Image
              src="/images/marca/logo-oficial.jpg"
              alt="Fantasia Encantada"
              width={1024}
              height={645}
              priority
              className={styles.logo}
            />
            <motion.span
              className={styles.rule}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease, delay: 0.4 }}
              aria-hidden="true"
            />
            <p className={styles.tag}>era uma vez…</p>
          </motion.div>

          <button type="button" className={styles.skip} onClick={close}>
            pular
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
