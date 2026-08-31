"use client";

import { useEffect, useRef } from "react";
import { visibleWorlds } from "@/data/worlds";
import styles from "./AmbientStage.module.css";

/**
 * Uma única camada de atmosfera fixa atrás de todo o conteúdo.
 * Cada seção declara `data-scene="<chave>"`; conforme ela domina a
 * viewport, o fundo inteiro dissolve para o clima daquela cena —
 * o site vira um espaço contínuo por onde se viaja, não blocos.
 */

interface Scene {
  bg: string;
  glow: string;
}

// Cenas fixas da jornada (home) + uma por mundo (derivada dos dados).
const HOME_SCENES: Record<string, Scene> = {
  sonho: {
    bg: "radial-gradient(120% 90% at 78% 26%, #4a2544 0%, #2e1a34 46%, #1c1020 100%)",
    glow: "rgba(233,206,156,0.16)",
  },
  momentos: {
    bg: "radial-gradient(120% 90% at 30% 20%, #f7e2e0 0%, #efd0cf 55%, #e6c3c6 100%)",
    glow: "rgba(210,138,156,0.22)",
  },
  espetaculo: {
    bg: "radial-gradient(120% 90% at 70% 30%, #3a1f3f 0%, #271633 50%, #1a1024 100%)",
    glow: "rgba(178,108,255,0.14)",
  },
  convite: {
    bg: "radial-gradient(100% 80% at 50% 0%, #4a2544 0%, #2a1730 55%, #150c1a 100%)",
    glow: "rgba(233,206,156,0.2)",
  },
};

function buildScenes(): Record<string, Scene> {
  const scenes: Record<string, Scene> = { ...HOME_SCENES };
  for (const w of visibleWorlds) {
    scenes[w.slug] = {
      bg: w.atmosphere.bg,
      glow: `color-mix(in srgb, ${w.atmosphere.glow} 40%, transparent)`,
    };
  }
  return scenes;
}

const SCENES = buildScenes();
const DEFAULT = HOME_SCENES.sonho;

export default function AmbientStage() {
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const active = useRef<"a" | "b">("a");
  const currentKey = useRef<string>("");

  useEffect(() => {
    const a = layerA.current;
    const b = layerB.current;
    const g = glow.current;
    if (!a || !b || !g) return;

    // Estado inicial
    a.style.background = DEFAULT.bg;
    a.style.opacity = "1";
    b.style.opacity = "0";
    g.style.background = `radial-gradient(circle at 78% 24%, ${DEFAULT.glow}, transparent 60%)`;

    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    if (scenes.length === 0) return;

    const ratios = new Map<Element, number>();

    const applyScene = (key: string) => {
      const scene = SCENES[key];
      if (!scene || key === currentKey.current) return;
      currentKey.current = key;

      const incoming = active.current === "a" ? b : a;
      const outgoing = active.current === "a" ? a : b;
      incoming.style.background = scene.bg;
      // força reflow p/ garantir a transição de opacidade
      void incoming.offsetWidth;
      incoming.style.opacity = "1";
      outgoing.style.opacity = "0";
      active.current = active.current === "a" ? "b" : "a";
      g.style.background = `radial-gradient(circle at 74% 26%, ${scene.glow}, transparent 62%)`;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let bestKey = "";
        let bestRatio = 0;
        for (const el of scenes) {
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestKey = (el as HTMLElement).dataset.scene ?? "";
          }
        }
        if (bestKey) applyScene(bestKey);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9] },
    );

    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.stage} aria-hidden="true">
      <div ref={layerA} className={styles.layer} />
      <div ref={layerB} className={styles.layer} />
      <div ref={glow} className={styles.glow} />
      <div className={styles.grain} />
    </div>
  );
}
