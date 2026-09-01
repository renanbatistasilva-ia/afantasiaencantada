"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import styles from "./CastleFrame.module.css";

interface Props {
  src: string;
  alt: string;
  position?: string;
  sizes?: string;
  parallax?: number;
  className?: string;
}

const CASTLE_CLIP = `polygon(
  10% 16%,
  10% 6%,
  12% 6%, 12% 3.5%, 14.5% 3.5%, 14.5% 0%, 16.5% 0%, 16.5% 3.5%, 19% 3.5%, 19% 6%, 21% 6%,
  21% 12%,
  28% 12%,
  28% 9.5%, 30% 9.5%, 30% 8%, 32% 8%, 32% 9.5%, 34% 9.5%,
  34% 12%,
  38% 12%,
  42% 5%, 50% 2.5%, 58% 5%,
  62% 12%,
  66% 12%,
  66% 9.5%, 68% 9.5%, 68% 8%, 70% 8%, 70% 9.5%, 72% 9.5%,
  72% 12%,
  79% 12%,
  79% 6%,
  81% 6%, 81% 3.5%, 83.5% 3.5%, 83.5% 0%, 85.5% 0%, 85.5% 3.5%, 88% 3.5%, 88% 6%, 90% 6%,
  90% 16%,
  90% 97%,
  88% 100%,
  12% 100%,
  10% 97%
)`;

export default function CastleFrame({
  src,
  alt,
  position = "50% 30%",
  sizes = "(max-width: 768px) 88vw, 44vw",
  parallax = 4,
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
    <div ref={ref} className={`${styles.castle} ${className ?? ""}`}>
      <div className={styles.photoMask} style={{ clipPath: CASTLE_CLIP }}>
        <motion.div className={styles.inner} style={{ y }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            style={{ objectFit: "cover", objectPosition: position }}
          />
        </motion.div>
      </div>

      {/* Borda dourada com a mesma silhueta */}
      <svg
        className={styles.frame}
        viewBox="0 0 300 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d={`
            M 30 67
            L 30 25 L 36 25 L 36 15 L 43.5 15 L 43.5 0 L 49.5 0 L 49.5 15 L 57 15 L 57 25 L 63 25
            L 63 50
            L 84 50
            L 84 40 L 90 40 L 90 34 L 96 34 L 96 40 L 102 40
            L 102 50
            L 114 50
            C 126 21 150 10.5 174 21 L 186 50
            L 198 50
            L 198 40 L 204 40 L 204 34 L 210 34 L 210 40 L 216 40
            L 216 50
            L 237 50
            L 237 25 L 243 25 L 243 15 L 250.5 15 L 250.5 0 L 256.5 0 L 256.5 15 L 264 15 L 264 25 L 270 25
            L 270 67
            L 270 407
            Q 270 420 258 420
            L 42 420
            Q 30 420 30 407
            Z
          `}
          stroke="var(--ouro-claro)"
          strokeWidth="1.5"
          opacity="0.75"
        />
        {/* Bandeirinhas */}
        <path d="M38 8 L45 4 L45 13 Z" fill="var(--ouro-claro)" opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-3 45 13;3 45 13;-3 45 13"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M262 8 L255 4 L255 13 Z" fill="var(--ouro-claro)" opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="3 255 13;-3 255 13;3 255 13"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </path>
        {/* Estrela no arco */}
        <circle cx="150" cy="16" r="2.5" fill="var(--ouro-claro)" opacity="0.55" />
        <circle cx="130" cy="22" r="1.5" fill="var(--ouro-claro)" opacity="0.3" />
        <circle cx="170" cy="22" r="1.5" fill="var(--ouro-claro)" opacity="0.3" />
      </svg>
    </div>
  );
}
