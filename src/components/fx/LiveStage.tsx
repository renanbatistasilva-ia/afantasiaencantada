"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import styles from "./LiveStage.module.css";

interface Props {
  src: string;
  alt: string;
  /** object-position da foto dentro do arco */
  position?: string;
  priority?: boolean;
  sizes?: string;
  /** PNG com fundo transparente do personagem — quando existir, "sai" da moldura */
  cutoutSrc?: string;
  cutoutPosition?: string;
  /** intensidade do movimento (0.6 sutil, 1 padrão, 1.5 marcante) */
  intensity?: number;
  /** cor da poeira/brilho ao redor (rgb sem alpha) */
  glow?: string;
  className?: string;
  /** transição de portal compartilhada (View Transitions) */
  viewTransitionName?: string;
}

/**
 * Palco vivo: a foto do personagem ganha profundidade em camadas que
 * reagem ao cursor (desktop) e à inclinação do aparelho (mobile), com
 * respiração/deriva idle e poeira dourada. Aceita um recorte PNG que
 * literalmente salta da moldura quando fornecido.
 */
export default function LiveStage({
  src,
  alt,
  position = "50% 25%",
  priority = false,
  sizes = "(max-width: 860px) 90vw, 46vw",
  cutoutSrc,
  cutoutPosition,
  intensity = 1,
  glow = "233, 206, 156",
  className,
  viewTransitionName,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);

  // ponteiro normalizado -1..1
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 18, mass: 0.6 });

  const k = reduced ? 0 : intensity;

  // camadas em taxas diferentes → profundidade
  const plateX = useTransform(sx, (v) => v * -10 * k);
  const plateY = useTransform(sy, (v) => v * -8 * k);
  const imgX = useTransform(sx, (v) => v * 14 * k);
  const imgY = useTransform(sy, (v) => v * 10 * k);
  const rotX = useTransform(sy, (v) => v * -4 * k);
  const rotY = useTransform(sx, (v) => v * 5 * k);
  const cutX = useTransform(sx, (v) => v * 26 * k);
  const cutY = useTransform(sy, (v) => v * 18 * k);
  const glowX = useTransform(sx, (v) => v * 18 * k);
  const glowY = useTransform(sy, (v) => v * 14 * k);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduced) return;
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;

    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      px.set(Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width / 2))));
      py.set(Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height / 2))));
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      // gamma: esquerda-direita (-90..90), beta: frente-trás (-180..180)
      const g = e.gamma ?? 0;
      const b = (e.beta ?? 0) - 45; // segurar o celular ~45°
      px.set(Math.max(-1, Math.min(1, g / 30)));
      py.set(Math.max(-1, Math.min(1, b / 30)));
    };

    if (fine) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      return () => window.removeEventListener("pointermove", onPointer);
    } else {
      window.addEventListener("deviceorientation", onOrient, true);
      return () => window.removeEventListener("deviceorientation", onOrient, true);
    }
  }, [inView, reduced, px, py]);

  return (
    <div ref={ref} className={`${styles.stage} ${className ?? ""}`}>
      <motion.div
        className={styles.frame}
        style={{ rotateX: rotX, rotateY: rotY }}
        data-live={inView ? "on" : "off"}
      >
        <motion.div className={styles.plate} style={{ x: plateX, y: plateY }}>
          <span
            className={styles.plateWash}
            style={{ background: `radial-gradient(circle at 50% 30%, rgba(${glow},0.22), transparent 60%)` }}
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          className={styles.photo}
          style={{
            x: imgX,
            y: imgY,
            ...(viewTransitionName ? { viewTransitionName } : {}),
          }}
        >
          <div className={`${styles.kenburns} ${reduced ? "" : styles.breathing}`}>
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={sizes}
              style={{ objectFit: "cover", objectPosition: position }}
            />
          </div>
          <span className={styles.veil} aria-hidden="true" />
        </motion.div>

        {cutoutSrc && (
          <motion.div className={styles.cutout} style={{ x: cutX, y: cutY }}>
            <Image
              src={cutoutSrc}
              alt=""
              fill
              sizes={sizes}
              style={{ objectFit: "contain", objectPosition: cutoutPosition ?? "50% 100%" }}
            />
          </motion.div>
        )}

        <motion.span
          className={styles.rim}
          style={{
            x: glowX,
            y: glowY,
            boxShadow: `0 0 0 1px rgba(${glow},0.45), 0 0 60px -8px rgba(${glow},0.3)`,
          }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
