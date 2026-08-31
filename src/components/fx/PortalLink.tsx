"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePortal } from "./PortalProvider";

interface Props {
  href: string;
  color: string;
  glow: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/** Link que abre um portal (íris na cor do mundo) antes de navegar. */
export default function PortalLink({
  href,
  color,
  glow,
  className,
  ariaLabel,
  children,
}: Props) {
  const { open } = usePortal();

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        // respeita abrir em nova aba / modificadores
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open({ x: e.clientX, y: e.clientY, color, glow, href });
      }}
    >
      {children}
    </Link>
  );
}
