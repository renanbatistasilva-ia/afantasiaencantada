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
  const isMobile = useRef(false);
  const prevPos = useRef<Perch>({ x: -100, y: -100 });

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
      setTimeout(() => emitDust(target.x, target.y, 10, 0.8), 700);
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
      setTimeout(() => setResting(false), REST_MS);
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
      setTimeout(() => {
        setBowing(false);
        setVisible(false);
        setTimeout(() => setVisible(true), EASTER_HIDE_MS);
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
            setTimeout(() => setPeeking(false), 2500);
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
      <circle cx="16" cy="5.5" r="3.2" />
      <path d="M13.8 9h4.4l1.2 8.5h-6.8l1.2-8.5z" />
      <path
        className={styles.wingL}
        d="M13.5 11c-5-1.5-8.5 1-10 5 3 1.5 7 0 9-3z"
        opacity="0.65"
      />
      <path
        className={styles.wingR}
        d="M18.5 11c5-1.5 8.5 1 10 5-3 1.5-7 0-9-3z"
        opacity="0.65"
      />
      <line x1="10" y1="4" x2="5.5" y2="0.5" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="5.5" cy="0.5" r="1.5" opacity="0.95" />
      <path d="M12.5 17.5l-1.5 7h2.5l1.5-4.5 1.5 4.5h2.5l-1.5-7z" />
    </svg>
  );
}
