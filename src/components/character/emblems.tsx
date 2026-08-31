import type { ReactNode } from "react";
import type { EmblemKey } from "@/data/types";

/**
 * Motivos SVG dos medalhões (viewBox 0 0 24 24, stroke currentColor).
 * Traços simples e legíveis mesmo em 24px.
 */
export const EMBLEMS: Record<EmblemKey, ReactNode> = {
  coroa: (
    <>
      <path d="M4 8l3.5 4L12 6l4.5 6L20 8v9H4V8z" />
      <path d="M4 17h16" />
    </>
  ),
  concha: (
    <>
      <path d="M12 20C6 20 3 15 3 11a9 9 0 0 1 18 0c0 4-3 9-9 9z" />
      <path d="M12 20V6M12 20c-2-3-4-5-6-7M12 20c2-3 4-5 6-7" />
    </>
  ),
  torre: (
    <>
      <path d="M9 21V8h6v13" />
      <path d="M8 8l1-3h6l1 3M12 5V3" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  lampada: (
    <>
      <path d="M4 15c4 2 12 2 16 0-1-3-4-4-8-4s-7 1-8 4z" />
      <path d="M12 11c1-2 4-3 6-2M20 15l1 2M6 15l-1 2" />
    </>
  ),
  onda: (
    <>
      <path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </>
  ),
  arco: (
    <>
      <path d="M5 19C5 11 11 5 19 5" />
      <path d="M5 19l14-14M5 19l4-1-3-3-1 4z" />
    </>
  ),
  rosa: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M12 9a2 2 0 0 1 2-2M12 9a2 2 0 0 0-2-2M12 13v8M9 17c-2 0-3 1-3 3M15 17c2 0 3 1 3 3" />
    </>
  ),
  tridente: (
    <>
      <path d="M12 3v18M8 21h8" />
      <path d="M6 5v3c0 3 2.7 5 6 5s6-2 6-5V5M6 5l1.5 2M18 5l-1.5 2" />
    </>
  ),
  aranha: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
    </>
  ),
  morcego: (
    <>
      <path d="M12 7C10 4 7 4 4 6c1 1 1 2 0 3 2 0 3 1 3 3 2-2 3-2 5-2s3 0 5 2c0-2 1-3 3-3-1-1-1-2 0-3-3-2-6-2-8 1z" />
      <path d="M12 7v3" />
    </>
  ),
  lua: (
    <>
      <path d="M20 13A8 8 0 1 1 11 4a6 6 0 0 0 9 9z" />
      <path d="M16 5l.5 1.5L18 7l-1.5.5L16 9l-.5-1.5L14 7l1.5-.5L16 5z" />
    </>
  ),
  patinha: (
    <>
      <ellipse cx="12" cy="15" rx="4" ry="3.5" />
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <circle cx="9.5" cy="6" r="1.4" />
      <circle cx="14.5" cy="6" r="1.4" />
    </>
  ),
  orelhas: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="6.5" r="2.5" />
      <circle cx="12" cy="14" r="5" />
    </>
  ),
  estrela: (
    <path d="M12 3l2.5 6L21 9.5l-5 4 1.7 6.5L12 16.8 6.3 20l1.7-6.5-5-4 6.5-.5L12 3z" />
  ),
  gato: (
    <>
      <path d="M5 9l1-4 3 2.5a7 7 0 0 1 6 0L18 5l1 4v5a7 7 0 0 1-14 0V9z" />
      <path d="M9 12h.01M15 12h.01M12 14l-1 1h2l-1-1z" />
    </>
  ),
  raio: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  abobora: (
    <>
      <path d="M12 6c4 0 7 3 7 7s-3 6-7 6-7-2-7-6 3-7 7-7z" />
      <path d="M12 6V3l2-1M9 11l1.5 1.5L9 14M15 11l-1.5 1.5L15 14M9.5 16h5" />
    </>
  ),
  fogueira: (
    <>
      <path d="M12 4c1 2 3 3 3 6a3 3 0 0 1-6 0c0-1 .5-2 1-3 .5 1 1 1.5 2 1.5" />
      <path d="M5 20l14-4M19 20L5 16" />
    </>
  ),
  presente: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16M12 9v11M12 9c-1-3-4-4-4-2s3 2 4 2zM12 9c1-3 4-4 4-2s-3 2-4 2z" />
    </>
  ),
  chapeu: (
    <>
      <path d="M3 17c3-1.5 15-1.5 18 0" />
      <path d="M7 17c0-4 1-9 5-9s5 5 5 9" />
      <path d="M7.5 13c3-1 6-1 9 0" />
    </>
  ),
  milho: (
    <>
      <path d="M12 3c3 0 5 3 5 8s-2 10-5 10-5-5-5-10 2-8 5-8z" />
      <path d="M12 5v14M9 9l3 1 3-1M9 13l3 1 3-1" />
    </>
  ),
};
