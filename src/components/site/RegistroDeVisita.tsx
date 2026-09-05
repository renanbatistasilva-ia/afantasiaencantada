"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { medirPagina, medirPermanencia } from "@/lib/medicao";

/** Segundos a partir dos quais consideramos que a página prendeu atenção. */
const LIMIARES = [15, 60];

/**
 * Conta a página aberta e quanto tempo ela segurou a pessoa.
 *
 * Precisa ser um componente separado do RegistroDeOrigem: aquele roda uma vez
 * por carregamento e guarda de onde a visita veio; este roda a cada troca de
 * rota, porque o site navega sem recarregar e sem isto só a primeira página
 * seria contada.
 *
 * Fica dentro do Vitrine, que já dá early-return em /admin — então o painel
 * nunca aparece nas próprias contas.
 *
 * Não desenha nada.
 */
export default function RegistroDeVisita() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    medirPagina(pathname);

    const relogios = LIMIARES.map((s) =>
      setTimeout(() => medirPermanencia(pathname, s), s * 1000),
    );
    // Sair antes do limiar cancela: quem passou correndo não conta como atenção.
    return () => relogios.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
