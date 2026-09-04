"use client";

import { useEffect } from "react";
import { registrarOrigem } from "@/lib/lead";

/**
 * Registra de onde a visita veio, uma vez por sessão.
 *
 * Fica no layout porque precisa rodar na PRIMEIRA página aberta, seja ela qual
 * for. Se rodasse só no formulário de reserva, quem chegasse pela home e
 * navegasse até lá já teria o próprio site como referrer.
 *
 * Não desenha nada.
 */
export default function RegistroDeOrigem() {
  useEffect(() => {
    registrarOrigem();
  }, []);
  return null;
}
