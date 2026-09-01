"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./Fairy.module.css";

const PERCH_SELECTORS = [
  "[data-scene] h2",
  "[data-scene] h3",
  '[class*="arch"]',
  '[class*="ChapterMark"]',
  '[class*="portalStage"]',
  '[class*="featurePhoto"]',
  '[class*="memberName"]',
];

const FLEE_DIST = 90;
const MAX_FLEES = 3;
const REST_MS = 8000;
const APPEAR_DELAY_MS = 8000;
const EASTER_DIST = 130;
const EASTER_HIDE_MS = 15000;
const TRAIL_INTERVAL_MS = 60;

interface Perch {
  x: number;
  y: number;
}

function emitDust(x: number, y: number, count = 18, speed = 1.8) {
  window.dispatchEvent(
    new CustomEvent("fairy-dust", { detail: { x, y, count, speed } }),
  );
}

/** Gathers perch positions in viewport coordinates (not absolute). */
function gatherVisiblePerches(): Perch[] {
  const perches: Perch[] = [];
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  for (const sel of PERCH_SELECTORS) {
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh) {
        perches.push({
          x: Math.max(30, Math.min(vw - 60, r.left + r.width * (0.3 + Math.random() * 0.4))),
          y: Math.max(30, Math.min(vh - 60, r.top - 8)),
        });
      }
    });
  }
  if (perches.length === 0) {
    perches.push({ x: vw * 0.6, y: vh * 0.3 });
  }
  return perches;
}

export default function Fairy() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Perch>({ x: -100, y: -100 });
  const [resting, setResting] = useState(false);
  const [bowing, setBowing] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [flying, setFlying] = useState(false);
  const flees = useRef(0);
  const lastFlee = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const trailTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const restTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bowTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const peekTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dustTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isMobile = useRef(false);
  const prevPos = useRef<Perch>({ x: -100, y: -100 });

  // Clear all pending timers on unmount
  useEffect(() => () => {
    clearTimeout(restTimer.current);
    clearTimeout(bowTimer.current);
    clearTimeout(hideTimer.current);
    clearTimeout(peekTimer.current);
    clearTimeout(dustTimer.current);
    clearTimeout(scrollTimer.current);
    clearInterval(trailTimer.current);
  }, []);

  const startTrail = useCallback((from: Perch, to: Perch) => {
    clearInterval(trailTimer.current);
    setFlying(true);
    let t = 0;
    const steps = 12;
    trailTimer.current = setInterval(() => {
      t++;
      const progress = t / steps;
      const cx = from.x + (to.x - from.x) * progress;
      const cy = from.y + (to.y - from.y) * progress;
      emitDust(cx, cy, 3, 0.6);
      if (t >= steps) {
        clearInterval(trailTimer.current);
        setFlying(false);
      }
    }, TRAIL_INTERVAL_MS);
  }, []);

  const flyTo = useCallback(
    (target: Perch) => {
      emitDust(pos.x, pos.y, 16, 1.6);
      startTrail(pos, target);
      prevPos.current = pos;
      setPos(target);
      dustTimer.current = setTimeout(() => emitDust(target.x, target.y, 10, 0.8), 700);
    },
    [pos, startTrail],
  );

  const flee = useCallback(() => {
    const now = Date.now();
    if (now - lastFlee.current < 1500 || resting || bowing || flying) return;
    lastFlee.current = now;
    flees.current++;

    const vis = gatherVisiblePerches();
    const cx = cursorRef.current.x;
    const cy = cursorRef.current.y;

    if (flees.current > MAX_FLEES) {
      setResting(true);
      flees.current = 0;
      restTimer.current = setTimeout(() => setResting(false), REST_MS);
      return;
    }

    const far = vis
      .filter((p) => Math.hypot(p.x - cx, p.y - cy) > EASTER_DIST)
      .sort((a, b) => {
        const da = Math.hypot(a.x - cx, a.y - cy);
        const db = Math.hypot(b.x - cx, b.y - cy);
        return db - da;
      });

    if (far.length === 0) {
      setBowing(true);
      emitDust(pos.x, pos.y, 60, 3);
      bowTimer.current = setTimeout(() => {
        setBowing(false);
        setVisible(false);
        hideTimer.current = setTimeout(() => setVisible(true), EASTER_HIDE_MS);
      }, 1800);
      return;
    }

    flyTo(far[0]);
  }, [pos, resting, bowing, flying, flyTo]);

  useEffect(() => {
    if (reduced) return;
    isMobile.current = window.matchMedia("(pointer: coarse)").matches;

    const timer = setTimeout(() => {
      const vis = gatherVisiblePerches();
      setPos(vis[Math.floor(Math.random() * vis.length)]);
      setVisible(true);
    }, APPEAR_DELAY_MS);

    return () => clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    if (!visible || reduced) return;

    const onPointerMove = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      const dist = Math.hypot(e.clientX - pos.x, e.clientY - pos.y);
      if (dist < FLEE_DIST && !resting && !bowing && !flying) {
        flee();
      }
    };

    const onScroll = () => {
      if (isMobile.current) {
        clearTimeout(scrollTimer.current);
        setPeeking(false);
        scrollTimer.current = setTimeout(() => {
          const vis = gatherVisiblePerches();
          if (vis.length > 0) {
            setPeeking(true);
            peekTimer.current = setTimeout(() => setPeeking(false), 2500);
          }
        }, 600);
      } else {
        const vis = gatherVisiblePerches();
        if (vis.length > 0) {
          const nearest = vis.reduce((best, p) =>
            Math.abs(p.y - pos.y) < Math.abs(best.y - pos.y) ? p : best
          );
          setPos(nearest);
        }
      }
    };

    if (!isMobile.current) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      const vis = gatherVisiblePerches();
      if (vis.length > 0) setPos(vis[0]);
    };
    window.addEventListener("resize", onResize);

    const idle = setInterval(() => {
      if (resting || bowing || flying) return;
      const vis = gatherVisiblePerches();
      if (vis.length > 1) {
        const next = vis[Math.floor(Math.random() * vis.length)];
        if (Math.hypot(next.x - pos.x, next.y - pos.y) > 60) {
          flyTo(next);
        }
      }
    }, 14000);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearInterval(idle);
      clearInterval(trailTimer.current);
      clearTimeout(scrollTimer.current);
      clearTimeout(peekTimer.current);
    };
  }, [visible, pos, resting, bowing, flying, flee, flyTo, reduced]);

  if (reduced || (!visible && !peeking)) return null;

  const screenX = pos.x;
  const screenY = pos.y;

  if (isMobile.current) {
    return (
      <motion.button
        type="button"
        className={`${styles.fairy} ${styles.mobile}`}
        animate={{
          x: peeking ? -6 : -50,
          opacity: peeking ? 0.7 : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        style={{ top: "45%" }}
        onClick={(e) => {
          emitDust(e.clientX, e.clientY, 30, 2.2);
          setPeeking(false);
        }}
        aria-label="Uma fada encantada!"
      >
        <FairySvg />
      </motion.button>
    );
  }

  return (
    <motion.div
      className={`${styles.fairy} ${resting ? styles.resting : ""} ${bowing ? styles.bowing : ""}`}
      initial={{ opacity: 0 }}
      animate={{
        x: screenX - 25,
        y: screenY - 25,
        opacity: visible ? (resting ? 0.4 : 0.7) : 0,
        scale: bowing ? 1.5 : 1,
        rotate: bowing ? 15 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 12,
        mass: 0.8,
        opacity: { duration: 2 },
      }}
      aria-hidden="true"
    >
      <FairySvg />
    </motion.div>
  );
}

function FairySvg() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Asas de borboleta — cada uma com pétala superior grande + pétala inferior menor */}
      <g className={styles.wingL} opacity="0.5">
        {/* Asa superior esquerda (going up and out) */}
        <path d="M14 12 C 9 7, 3 8, 2 13 C 3 15, 8 15, 14 14 Z" />
        {/* Asa inferior esquerda (going down and out) */}
        <path d="M14 15 C 9 17, 5 20, 5 22 C 8 22, 12 20, 14 17 Z" opacity="0.85" />
      </g>
      <g className={styles.wingR} opacity="0.5">
        <path d="M18 12 C 23 7, 29 8, 30 13 C 29 15, 24 15, 18 14 Z" />
        <path d="M18 15 C 23 17, 27 20, 27 22 C 24 22, 20 20, 18 17 Z" opacity="0.85" />
      </g>

      {/* Cabelo — silhueta atrás da cabeça com maria-chiquinhas descendo dos lados */}
      <path d="M10.5 6 C 10.5 3, 13 2, 16 2 C 19 2, 21.5 3, 21.5 6 L 21.5 9 Q 22 11.5, 20.5 12 L 19.5 8 L 12.5 8 L 11.5 12 Q 10 11.5, 10.5 9 Z" opacity="0.95" />
      {/* Maria-chiquinha esquerda */}
      <ellipse cx="10.5" cy="11.5" rx="1.4" ry="2.2" opacity="0.9" />
      {/* Maria-chiquinha direita */}
      <ellipse cx="21.5" cy="11.5" rx="1.4" ry="2.2" opacity="0.9" />
      {/* Florzinha no topo (só uma, centralizada) */}
      <circle cx="15" cy="2.5" r="0.7" opacity="0.85" />
      <circle cx="16.5" cy="1.8" r="0.7" opacity="0.85" />
      <circle cx="17" cy="3.2" r="0.7" opacity="0.85" />
      <circle cx="16" cy="2.5" r="0.35" fill="var(--marfim)" opacity="0.95" />

      {/* Cabeça grande (chibi) — na frente do cabelo, esconde parte de cima */}
      <circle cx="16" cy="7" r="3.6" />

      {/* Olhinhos grandes (marca registrada de fadinha fofa) */}
      <ellipse cx="14.6" cy="7.3" rx="0.55" ry="0.75" fill="var(--noite)" />
      <ellipse cx="17.4" cy="7.3" rx="0.55" ry="0.75" fill="var(--noite)" />
      {/* Brilhinhos nos olhos */}
      <circle cx="14.8" cy="7.1" r="0.22" fill="var(--marfim)" />
      <circle cx="17.6" cy="7.1" r="0.22" fill="var(--marfim)" />

      {/* Sorriso — arco pequenininho */}
      <path d="M15 8.7 Q16 9.3 17 8.7" stroke="var(--noite)" strokeWidth="0.35" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* Bochechas rosadinhas */}
      <circle cx="13.5" cy="8.2" r="0.45" opacity="0.35" />
      <circle cx="18.5" cy="8.2" r="0.45" opacity="0.35" />

      {/* Pescocinho */}
      <rect x="15.4" y="10.5" width="1.2" height="1" rx="0.3" opacity="0.85" />

      {/* Vestidinho — corpete + saia campânula em pétalas */}
      {/* Corpete */}
      <path d="M13.5 12 Q16 11.3 18.5 12 L 18 15 L 14 15 Z" />
      {/* Cinta brilhante */}
      <line x1="14" y1="14.7" x2="18" y2="14.7" stroke="var(--marfim)" strokeWidth="0.25" opacity="0.6" />
      {/* Saia em campânula (mais larga em baixo) */}
      <path d="M14 15 L 18 15 L 20 21 Q 16 22 12 21 Z" />
      {/* Barra em pétalas */}
      <path d="M12 21 Q 13 22.3 14 21 Q 15 22.5 16 21 Q 17 22.5 18 21 Q 19 22.3 20 21" fill="currentColor" opacity="0.95" />

      {/* Bracinhos ao lado — fininhos */}
      <path d="M13 13 Q 12 15 12.5 17" stroke="currentColor" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M19 13 Q 20 15 20 17" stroke="currentColor" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.9" />
      {/* Mãozinhas */}
      <circle cx="12.5" cy="17" r="0.7" />
      <circle cx="20" cy="17" r="0.7" />

      {/* Perninhas */}
      <rect x="14.5" y="21.8" width="0.9" height="2.2" rx="0.4" opacity="0.9" />
      <rect x="16.6" y="21.8" width="0.9" height="2.2" rx="0.4" opacity="0.9" />
      {/* Sapatinhos ballet */}
      <ellipse cx="14.95" cy="24.3" rx="0.85" ry="0.45" />
      <ellipse cx="17.05" cy="24.3" rx="0.85" ry="0.45" />

      {/* Varinha na mão direita */}
      <line x1="20" y1="17" x2="25" y2="12.5" stroke="currentColor" strokeWidth="0.45" opacity="0.9" />
      {/* Estrelinha da varinha */}
      <path d="M25 10.8 L25.55 12.15 L27 12.5 L25.55 12.85 L25 14.2 L24.45 12.85 L23 12.5 L24.45 12.15 Z" opacity="0.95" />
      <circle cx="25" cy="12.5" r="0.35" fill="var(--marfim)" />
    </svg>
  );
}
