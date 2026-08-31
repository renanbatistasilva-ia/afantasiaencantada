"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./PortalProvider.module.css";

interface OpenArgs {
  x: number;
  y: number;
  color: string;
  glow: string;
  href: string;
}

interface Ctx {
  open: (args: OpenArgs) => void;
}

const PortalCtx = createContext<Ctx>({ open: () => {} });
export const usePortal = () => useContext(PortalCtx);

type Phase = "idle" | "expand" | "reveal";

export default function PortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const open = useCallback(
    (a: OpenArgs) => {
      if (reduced) {
        router.push(a.href);
        return;
      }
      clear();
      setArgs(a);
      setPhase("expand");
      // sob a cobertura, navega; depois revela
      timers.current.push(
        setTimeout(() => router.push(a.href), 560),
        setTimeout(() => setPhase("reveal"), 720),
        setTimeout(() => {
          setPhase("idle");
          setArgs(null);
        }, 1350),
      );
    },
    [reduced, router],
  );

  useEffect(() => clear, []);

  const radius = args
    ? Math.hypot(
        Math.max(args.x, (typeof window !== "undefined" ? window.innerWidth : 0) - args.x),
        Math.max(args.y, (typeof window !== "undefined" ? window.innerHeight : 0) - args.y),
      )
    : 0;

  return (
    <PortalCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && args && (
          <motion.div
            className={styles.overlay}
            initial={false}
            animate={{ opacity: phase === "reveal" ? 0 : 1 }}
            transition={{ duration: phase === "reveal" ? 0.6 : 0.2 }}
            aria-hidden="true"
          >
            <motion.span
              className={styles.iris}
              style={{
                left: args.x,
                top: args.y,
                width: radius * 2,
                height: radius * 2,
                background: `radial-gradient(circle, ${args.color} 40%, ${args.glow} 78%, transparent 100%)`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: phase === "expand" ? 1 : 1.15 }}
              transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.span
              className={styles.ring}
              style={{ left: args.x, top: args.y, width: radius * 2, height: radius * 2 }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PortalCtx.Provider>
  );
}
