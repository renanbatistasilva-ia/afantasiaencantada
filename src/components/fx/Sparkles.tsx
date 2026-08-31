"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Partículas por 100.000 px² — o mobile usa automaticamente ~60% disso */
  density?: number;
  color?: string;
  className?: string;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  speed: number;
}

/** Poeira de fada: pontos de luz discretos que sobem lentamente e cintilam. */
export default function Sparkles({ density = 1.6, color = "233, 206, 156", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let motes: Mote[] = [];
    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const seed = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(((w * h) / 100000) * density * (isMobile ? 0.6 : 1));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vy: 0.06 + Math.random() * 0.18,
        vx: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.02,
      }));
    };

    const tick = () => {
      if (!running) return;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy;
        m.x += m.vx;
        m.phase += m.speed;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        const twinkle = 0.25 + 0.75 * (0.5 + Math.sin(m.phase) / 2);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.55 * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    seed();
    const ro = new ResizeObserver(seed);
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [density, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
