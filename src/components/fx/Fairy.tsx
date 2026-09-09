"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  '[class*="medallion"]',
  '[class*="rosterLink"]',
  '[class*="chipAvatar"]',
];

const FLEE_DIST = 110;
const MAX_FLEES = 3;
const REST_MS = 8000;
/** Intervalo entre as trocas. Acima de ~10s ela volta a parecer parada. */
const TROCA_MIN_MS = 5000;
const TROCA_MAX_MS = 9000;
/** Quanto tempo ela fica sumida entre a poeira e o reaparecimento. */
const SUMICO_MS = 260;
const APPEAR_DELAY_MS = 3000;
const EASTER_DIST = 130;
const EASTER_HIDE_MS = 15000;
const TRAIL_INTERVAL_MS = 60;

/**
 * Nove poses recortadas de uma colagem que a dona montou.
 *
 * São poses, não quadros de animação: não há intermediários, então dá para
 * trocar de atitude, não para bater asa. Todas saem da mesma folha, na mesma
 * escala, sobre uma tela de tamanho único — assim ela não muda de tamanho ao
 * trocar. A décima da colagem ficou de fora: é a fadinha espiando por trás de
 * uma barra branca que faz parte do arquivo, e metade do corpo dela não existe.
 *
 * Juntas pesam 147 KB, menos que os 157 KB do PNG único que havia antes — e
 * carregam sob demanda, então a primeira pintura custa ~15 KB.
 */
const POSES = Array.from(
  { length: 9 },
  (_, i) => `/images/marca/fadinha/pose${i + 1}.webp`,
);

/** Pousada e de descanso são fixas: mudar de corpo parada quebra a ilusão. */
const POSE_DESCANSO = POSES[4];
const POSE_REVERENCIA = POSES[8];

const PORTAL_MS = 1400;

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
  // No celular o layout é uma coluna centralizada, então os poleiros nascem
  // todos no meio: medido na produção, ela usava uma faixa de 16px numa tela de
  // 375 — 4% da largura, contra 51% no desktop. Aqui a altura continua vindo do
  // conteúdo, mas a posição horizontal varre a tela inteira.
  const estreito = vw < 860;
  for (const sel of PERCH_SELECTORS) {
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh) {
        perches.push({
          x: estreito
            ? vw * (0.12 + Math.random() * 0.76)
            : Math.max(
                30,
                Math.min(
                  vw - 60,
                  r.left + r.width * (0.3 + Math.random() * 0.4),
                ),
              ),
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

/**
 * Um pouso é aceitável quando ela não cobre o MIOLO de um texto.
 *
 * Medido: sem filtro nenhum, ela ficava sobre texto em 46% das amostras — a 72%
 * de opacidade, isso atrapalha quem está lendo para decidir contratar. Mas
 * exigir zero sobreposição prendeu ela num canto: a faixa que ela percorria no
 * desktop caiu de 51% para 12% da largura, porque metade da tela é texto.
 *
 * O meio-termo é medir a área: encostar na borda de um parágrafo não incomoda,
 * sentar no meio dele sim.
 */
const TOLERANCIA_SOBREPOSICAO = 0.22;

function pousoAceitavel(p: Perch, alvos: DOMRect[]): boolean {
  const meia = 34;
  const cx0 = p.x - meia,
    cx1 = p.x + meia,
    cy0 = p.y - meia,
    cy1 = p.y + meia + 24;
  const area = (cx1 - cx0) * (cy1 - cy0);
  let coberto = 0;
  for (const r of alvos) {
    const w = Math.min(cx1, r.right) - Math.max(cx0, r.left);
    const h = Math.min(cy1, r.bottom) - Math.max(cy0, r.top);
    if (w > 0 && h > 0) coberto += w * h;
  }
  return coberto / area <= TOLERANCIA_SOBREPOSICAO;
}

/** Só o texto que de fato aparece agora, medido uma vez por troca. */
function textosVisiveis(): DOMRect[] {
  const out: DOMRect[] = [];
  document.querySelectorAll("p, h1, h2, h3, li, a, button").forEach((el) => {
    if (el.children.length > 0) return;
    const txt = el.textContent?.trim();
    if (!txt || txt.length < 3) return;
    const r = el.getBoundingClientRect();
    if (
      r.width > 0 &&
      r.height > 0 &&
      r.top < window.innerHeight &&
      r.bottom > 0
    )
      out.push(r);
  });
  return out;
}

export default function Fairy() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Perch>({ x: -100, y: -100 });
  const [resting, setResting] = useState(false);
  const [bowing, setBowing] = useState(false);
  const [flying, setFlying] = useState(false);
  // A pose muda no POUSO, nunca em pleno ar: trocar de corpo no meio do voo
  // faria parecer outra personagem. A próxima é escolhida ao decolar, então
  // carrega durante o trajeto e chega pronta.
  const [pose, setPose] = useState(POSES[0]);
  const proxima = useRef(POSES[0]);
  const [portal, setPortal] = useState<Perch | null>(null);
  const flees = useRef(0);
  const lastFlee = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const trailTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const restTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bowTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dustTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const portalTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fechaTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sumicoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevPos = useRef<Perch>({ x: -100, y: -100 });

  /**
   * Espelho do estado, lido pelo agendador.
   *
   * Sem isto, o efeito que agenda a próxima troca precisa de `pos` nas
   * dependências — e como o `onScroll` chama `setPos` a cada evento, cada
   * rolagem cancelava e reagendava o intervalo. Medido antes da correção:
   * 30 segundos rolando sem parar, ZERO trocas. O número configurado era
   * ficção; o gargalo nunca foi o intervalo.
   */
  const estado = useRef({
    pos,
    resting: false,
    bowing: false,
    flying: false,
    pose: POSES[0],
  });
  estado.current = { pos, resting, bowing, flying, pose };

  // Clear all pending timers on unmount
  useEffect(
    () => () => {
      clearTimeout(restTimer.current);
      clearTimeout(bowTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(dustTimer.current);
      clearTimeout(portalTimer.current);
      clearTimeout(fechaTimer.current);
      clearTimeout(sumicoTimer.current);
      clearInterval(trailTimer.current);
    },
    [],
  );

  const startTrail = useCallback(
    (from: Perch, to: Perch, aoChegar?: () => void) => {
      clearInterval(trailTimer.current);
      setFlying(true);
      let t = 0;
      const steps = 12;
      // Curved trail: perpendicular sine offset for arc effect
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy);
      const nx = len > 0 ? -dy / len : 0;
      const ny = len > 0 ? dx / len : 0;
      const perpMag = Math.min(80, len * 0.2) * (Math.random() > 0.5 ? 1 : -1);
      trailTimer.current = setInterval(() => {
        t++;
        const progress = t / steps;
        const perp = Math.sin(progress * Math.PI);
        const cx = from.x + dx * progress + nx * perp * perpMag;
        const cy = from.y + dy * progress + ny * perp * perpMag;
        emitDust(cx, cy, 8, 1.4);
        if (t >= steps) {
          clearInterval(trailTimer.current);
          setFlying(false);
          // A pose troca AQUI, no mesmo instante em que o voo acaba. Antes era um
          // setTimeout de 700ms correndo em paralelo ao rastro de 720ms: dois
          // relógios que batiam por coincidência. Amarrado ao fim do rastro, a
          // garantia de "nunca troca em pleno ar" é estrutural, não sorte.
          aoChegar?.();
        }
      }, TRAIL_INTERVAL_MS);
    },
    [],
  );

  const flyTo = useCallback(
    (target: Perch) => {
      emitDust(pos.x, pos.y, 16, 1.6);
      startTrail(pos, target, () => setPose(proxima.current));
      prevPos.current = pos;
      setPos(target);

      // Sorteia agora, sem repetir a atual, e aplica só quando pousa. O
      // navegador busca o arquivo durante o voo, então não há piscada.
      const outras = POSES.filter((f) => f !== pose);
      proxima.current = outras[Math.floor(Math.random() * outras.length)];

      dustTimer.current = setTimeout(
        () => emitDust(target.x, target.y, 10, 0.8),
        700,
      );
    },
    [pos, pose, startTrail],
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
      setPose(POSE_DESCANSO);
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
      setPose(POSE_REVERENCIA);
      emitDust(pos.x, pos.y, 60, 3);
      bowTimer.current = setTimeout(() => {
        // Saída pelo portal: o anel abre em volta dela e ela entra, em vez de
        // simplesmente sumir.
        setPortal(pos);
        portalTimer.current = setTimeout(() => {
          setBowing(false);
          setVisible(false);
          setPortal(null);
          hideTimer.current = setTimeout(
            () => setVisible(true),
            EASTER_HIDE_MS,
          );
        }, PORTAL_MS * 0.6);
      }, 1800);
      return;
    }

    flyTo(far[0]);
  }, [pos, resting, bowing, flying, flyTo]);

  useEffect(() => {
    if (reduced) return;

    // Chegada pelo portal: antes ela materializava do nada. O anel abre no
    // lugar onde ela vai surgir, ela sai voando de dentro, o anel fecha.
    const timer = setTimeout(() => {
      const vis = gatherVisiblePerches();
      const onde = vis[Math.floor(Math.random() * vis.length)];
      setPos(onde);
      setPose(POSES[Math.floor(Math.random() * POSES.length)]);
      setPortal(onde);
      emitDust(onde.x, onde.y, 26, 1.2);
      portalTimer.current = setTimeout(
        () => setVisible(true),
        PORTAL_MS * 0.35,
      );
      fechaTimer.current = setTimeout(() => setPortal(null), PORTAL_MS);
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

    // Touch: any tap updates cursor and triggers flee if close
    const onPointerDown = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      const dist = Math.hypot(e.clientX - pos.x, e.clientY - pos.y);
      if (dist < FLEE_DIST && !resting && !bowing && !flying) {
        flee();
      }
    };

    // Ela é `position: fixed`, então já fica na tela sozinha durante a rolagem.
    // Reancorar a cada evento só fazia ela escorregar sem propósito — e, quando
    // o agendador ainda dependia de `pos`, reiniciava o temporizador a cada
    // evento. Agora espera a rolagem parar, e só age se ela tiver ficado longe
    // de qualquer conteúdo.
    let paradaTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(paradaTimer);
      paradaTimer = setTimeout(() => {
        const vis = gatherVisiblePerches();
        if (vis.length === 0) return;

        // Ela escolheu um pouso livre, mas a página andou por baixo. Se agora
        // está sentada no meio de um texto, sai de lá — com a mesma poeira das
        // trocas normais, para parecer intenção e não correção.
        // Sair do caminho é bom; sair do caminho a cada rolagem cansa. Medido
        // sem esta trava: 11 trocas em 28 segundos numa rolagem contínua, quase
        // uma a cada dois segundos. A trava só limita ESTE gatilho — a cadência
        // normal de 5 a 9 segundos continua igual.
        const { resting, bowing, flying } = estado.current;
        const descansada = Date.now() - ultimaTroca.current > TROCA_MIN_MS;
        if (
          descansada &&
          !resting &&
          !bowing &&
          !flying &&
          !pousoAceitavel(pos, textosVisiveis())
        ) {
          sumirEReaparecer();
          return;
        }

        const perto = vis.some(
          (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 180,
        );
        if (perto) return;
        const nearest = vis.reduce((best, p) =>
          Math.abs(p.y - pos.y) < Math.abs(best.y - pos.y) ? p : best,
        );
        setPos(nearest);
      }, 400);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      const vis = gatherVisiblePerches();
      if (vis.length > 0) setPos(vis[0]);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(paradaTimer);
      window.removeEventListener("resize", onResize);
      clearInterval(trailTimer.current);
    };
  }, [visible, pos, resting, bowing, flying, flee, flyTo, reduced]);

  /**
   * Some numa nuvem de poeira e reaparece noutro lugar, em outra pose.
   *
   * É a troca ociosa: mais legível que deslizar de um ponto a outro, e usa a
   * poeira que já existe, sem imagem nova. O portal fica reservado para a troca
   * de página, para não virar rotina.
   */
  const ultimaTroca = useRef(0);
  const sumirEReaparecer = useCallback(() => {
    ultimaTroca.current = Date.now();
    const { pos: atual, pose: atualPose } = estado.current;
    emitDust(atual.x, atual.y, 34, 2.2);
    setVisible(false);

    sumicoTimer.current = setTimeout(() => {
      const vis = gatherVisiblePerches();
      const longe = vis.filter(
        (p) => Math.hypot(p.x - atual.x, p.y - atual.y) > 120,
      );
      const candidatos = longe.length ? longe : vis;

      // Prefere pousar onde não há texto embaixo. Se a tela inteira for texto,
      // aceita qualquer um: sumir de vez seria pior que atrapalhar um pouco.
      const alvos = textosVisiveis();
      const livres = candidatos.filter((p) => pousoAceitavel(p, alvos));
      const lista = livres.length ? livres : candidatos;
      const destino = lista[Math.floor(Math.random() * lista.length)];
      if (!destino) return;
      const outras = POSES.filter((f) => f !== atualPose);
      setPos(destino);
      setPose(outras[Math.floor(Math.random() * outras.length)]);
      setVisible(true);
      emitDust(destino.x, destino.y, 28, 1.6);
    }, SUMICO_MS);
  }, []);

  /**
   * O agendador vive sozinho, dependendo só de `visible` e `reduced`.
   *
   * Enquanto ele dependia de `pos`, cada rolagem o reiniciava — e o intervalo
   * configurado nunca chegava ao fim. O estado mutável entra por referência.
   */
  useEffect(() => {
    if (!visible || reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const agendar = () => {
      timer = setTimeout(
        () => {
          const { resting, bowing, flying } = estado.current;
          if (!resting && !bowing && !flying) sumirEReaparecer();
          agendar();
        },
        TROCA_MIN_MS + Math.random() * (TROCA_MAX_MS - TROCA_MIN_MS),
      );
    };
    agendar();
    return () => clearTimeout(timer);
  }, [visible, reduced, sumirEReaparecer]);

  /**
   * Troca de página: o portal abre e ela reaparece em outra pose.
   *
   * O componente vive no layout, então sobrevive à navegação do lado do
   * cliente — sem isto ela apenas continuaria parada onde estava, como se a
   * página não tivesse mudado. O primeiro caminho é ignorado: quem cuida da
   * chegada é o efeito de estreia, que já abre o portal.
   */
  const primeiroCaminho = useRef(true);
  useEffect(() => {
    if (reduced) return;
    if (primeiroCaminho.current) {
      primeiroCaminho.current = false;
      return;
    }
    const vis = gatherVisiblePerches();
    const onde = vis[Math.floor(Math.random() * vis.length)];
    if (!onde) return;
    const outras = POSES.filter((f) => f !== estado.current.pose);

    setVisible(false);
    setPos(onde);
    setPose(outras[Math.floor(Math.random() * outras.length)]);
    setPortal(onde);
    emitDust(onde.x, onde.y, 26, 1.2);
    portalTimer.current = setTimeout(() => setVisible(true), PORTAL_MS * 0.35);
    fechaTimer.current = setTimeout(() => setPortal(null), PORTAL_MS);
  }, [pathname, reduced]);

  // O portal pode estar aberto antes de ela existir (chegada) — por isso ele é
  // desenhado fora do `if` que esconde a fadinha.
  if (reduced) return null;
  if (!visible && !portal) return null;

  const screenX = pos.x;
  const screenY = pos.y;

  const leanRotation = Math.max(
    -8,
    Math.min(8, (screenX - prevPos.current.x) * 0.03),
  );

  return (
    <>
      {portal && <Portal at={portal} />}
      {visible && (
        <motion.div
          className={`${styles.fairy} ${resting ? styles.resting : ""} ${bowing ? styles.bowing : ""}`}
          // Nasce JÁ na boca do portal e pequena, crescendo — é o que faz
          // parecer que saiu de dentro. Sem o x/y aqui, a mola partia de 0,0 e
          // ela vinha voando do canto da tela até o anel, o que entrega o truque.
          initial={{
            opacity: 0,
            x: screenX - 26,
            y: screenY - 26,
            scale: 0.35,
          }}
          animate={{
            x: screenX - 26,
            y: screenY - 26,
            opacity: visible ? (resting ? 0.48 : 0.72) : 0,
            scale: bowing ? 1.5 : 1,
            rotate: bowing ? 15 : leanRotation,
          }}
          transition={{
            type: "spring",
            stiffness: 32,
            damping: 14,
            mass: 1.1,
            opacity: { duration: 2 },
          }}
          aria-hidden="true"
        >
          <FairyImg src={pose} />
        </motion.div>
      )}
    </>
  );
}

function FairyImg({ src }: { src: string }) {
  return (
    <img key={src} src={src} alt="" className={styles.img} draggable={false} />
  );
}

/** O anel com o centro vazado. Ela fica atrás dele e parece sair do buraco. */
function Portal({ at }: { at: Perch }) {
  return (
    <motion.img
      src="/images/marca/fadinha/portal.webp"
      alt=""
      className={styles.portal}
      initial={{ opacity: 0, scale: 0.35, rotate: -25 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.35, 1, 1, 0.5],
        rotate: [-25, 0, 0, 18],
      }}
      transition={{
        duration: PORTAL_MS / 1000,
        times: [0, 0.3, 0.7, 1],
        ease: "easeOut",
      }}
      style={{ left: at.x, top: at.y }}
      draggable={false}
      aria-hidden="true"
    />
  );
}
