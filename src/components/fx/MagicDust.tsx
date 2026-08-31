"use client";

import { useEffect, useRef } from "react";

/**
 * A varinha invisível: no desktop, um rastro de poeira dourada segue
 * o cursor; no toque, cada toque espalha um estouro de brilhos.
 * Um único canvas em tela cheia, rAF, sem custo quando parado.
 */

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
  spin: number;
}

const GOLDS = [
  [233, 206, 156],
  [201, 162, 92],
  [255, 233, 191],
  [210, 138, 156],
];

export default function MagicDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let raf = 0;
    let lastEmit = 0;
    let lastX = 0;
    let lastY = 0;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (x: number, y: number, n: number, spread: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        const g = GOLDS[(Math.random() * GOLDS.length) | 0];
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * speed;
        motes.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 0.2,
          life: 0,
          max: 40 + Math.random() * 40,
          size: 0.8 + Math.random() * 2.2,
          hue: (g[0] << 16) | (g[1] << 8) | g[2],
          spin: (Math.random() - 0.5) * 0.2,
        });
      }
      if (motes.length > 420) motes = motes.slice(-420);
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      lastX = e.clientX;
      lastY = e.clientY;
      // emite proporcional à velocidade, com teto
      if (now - lastEmit > 16 && dist > 2) {
        lastEmit = now;
        spawn(e.clientX, e.clientY, Math.min(3, 1 + (dist / 40) | 0), 6, 0.5);
      }
    };

    const onTap = (e: PointerEvent) => {
      spawn(e.clientX, e.clientY, 26, 10, 2.4);
    };

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    // estouro no toque (e também no clique de mouse, dá um charme)
    window.addEventListener("pointerdown", onTap, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life++;
        if (m.life >= m.max) {
          motes.splice(i, 1);
          continue;
        }
        m.x += m.vx;
        m.y += m.vy;
        m.vy += 0.012; // gravidade leve
        m.vx *= 0.97;
        m.vy *= 0.97;
        const t = m.life / m.max;
        const alpha = Math.sin((1 - t) * Math.PI) * 0.9;
        const r = (m.hue >> 16) & 255;
        const g = (m.hue >> 8) & 255;
        const b = m.hue & 255;
        const size = m.size * (1 - t * 0.4);
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTap);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 70,
      }}
    />
  );
}
