"use client";

import { usePathname } from "next/navigation";
import CurtainIntro from "@/components/site/CurtainIntro";
import Fairy from "@/components/fx/Fairy";
import Header from "@/components/site/Header";
import MagicDust from "@/components/fx/MagicDust";
import RegistroDeOrigem from "@/components/site/RegistroDeOrigem";
import RegistroDeVisita from "@/components/site/RegistroDeVisita";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";

/**
 * Tudo que faz do site uma vitrine — e que não faz sentido numa ferramenta.
 *
 * O painel de leads é aberto várias vezes por dia para trabalhar. A cortina de
 * abertura, encantadora na primeira visita, ali seria 2,6 segundos de espera com
 * o scroll travado; a fada que persegue o cursor e o rastro de poeira mágica
 * disputariam atenção com um telefone que precisa ser lido certo.
 *
 * A guarda mora aqui, e não dentro de cada componente, porque quase todos usam
 * useState/useEffect: um `return` antecipado antes dos hooks mudaria a
 * quantidade deles entre renderizações da mesma instância quando a rota muda.
 * Montando e desmontando o conjunto inteiro, o problema não existe.
 */
export default function Vitrine({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <RegistroDeOrigem />
      <RegistroDeVisita />
      <MagicDust />
      <Fairy />
      <CurtainIntro />
      <Header />
      {children}
      <WhatsAppFloat />
    </>
  );
}
