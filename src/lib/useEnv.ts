"use client";

import { useEffect, useLayoutEffect, useState } from "react";

/** Detecta mobile por largura de viewport (SSR-safe). */
export function useIsMobile(query = "(max-width: 768px)") {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setIs(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return is;
}

/** True quando o usuário pede menos movimento. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True em dispositivos com ponteiro fino (mouse) — libera efeitos de cursor. */
export function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

/**
 * `useLayoutEffect` no navegador, `useEffect` na geração do site.
 *
 * Existe para uma coisa só: ler algo do navegador **antes da primeira pintura**.
 * O `useEffect` roda depois de pintar, então quem o usa para corrigir o estado
 * inicial mostra um quadro com o valor errado. O `useLayoutEffect` corrige antes
 * — mas avisa no console quando roda na geração estática, onde não existe layout.
 *
 * Os outros ganchos deste arquivo deliberadamente aceitam esse quadro errado
 * (começam em `false` e ajustam depois), porque para largura de tela e
 * preferência de movimento isso é invisível. Para o estado de um formulário não é.
 */
export const useEfeitoAntesDePintar =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
