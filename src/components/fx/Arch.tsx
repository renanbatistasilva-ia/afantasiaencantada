"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import styles from "./Arch.module.css";

interface Props {
  src: string;
  alt: string;
  position?: string;
  sizes?: string;
  priority?: boolean;
  /** Intensidade do parallax interno (0 desliga) */
  parallax?: number;
  className?: string;
}

/**
 * Moldura em arco de portal — o motivo visual recorrente da marca.
 * A foto respira dentro do arco com um parallax sutil no scroll.
 */
export default function Arch({
  src,
  alt,
  position = "50% 30%",
  sizes = "(max-width: 768px) 88vw, 44vw",
  priority = false,
  parallax = 6,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const amount = reduced ? 0 : parallax;
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={`${styles.arch} ${className ?? ""}`}>
      <motion.div className={styles.inner} style={{ y }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover", objectPosition: position }}
        />
      </motion.div>
    </div>
  );
}
