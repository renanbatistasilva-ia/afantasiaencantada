"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Variant = "rise" | "drift-left" | "drift-right" | "bloom" | "fade";

interface Props {
  children: ReactNode;
  delay?: number;
  /** Deslocamento base em px */
  rise?: number;
  variant?: Variant;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function initialFor(variant: Variant, rise: number) {
  switch (variant) {
    case "drift-left":
      return { opacity: 0, x: -rise - 18, y: 8 };
    case "drift-right":
      return { opacity: 0, x: rise + 18, y: 8 };
    case "bloom":
      return { opacity: 0, scale: 0.9, y: rise * 0.6 };
    case "fade":
      return { opacity: 0 };
    case "rise":
    default:
      return { opacity: 0, y: rise };
  }
}

/** Revelação coreografada na entrada em viewport. Varie o `variant` por seção. */
export default function Reveal({
  children,
  delay = 0,
  rise = 26,
  variant = "rise",
  className,
}: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : initialFor(variant, rise)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: variant === "bloom" ? 1.05 : 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
