import type { Metadata } from "next";
import Hero from "@/components/journey/Hero";
import Dream from "@/components/journey/Dream";
import Worlds from "@/components/journey/Worlds";
import Depoimentos from "@/components/journey/Depoimentos";
import Moments from "@/components/journey/Moments";
import Experience from "@/components/journey/Experience";
import FAQ from "@/components/journey/FAQ";
import BookingInvite from "@/components/journey/BookingInvite";
import Footer from "@/components/site/Footer";

/**
 * A home era a única página sem canônica — todas as outras declaram a sua.
 * Importa porque o link da bio do Instagram leva `?utm_source=instagram`, e sem
 * isto o buscador pode tratar essa variante como uma segunda página.
 *
 * Fica aqui, e não no layout: no layout, uma página futura que esquecesse de
 * declarar a sua herdaria "/" e diria ao buscador que é a home.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};


export default function Home() {
  return (
    <main>
      <Hero />
      <Dream />
      <Worlds />
      <Depoimentos />
      <Moments />
      <Experience />
      <FAQ />
      <BookingInvite />
      <Footer />
    </main>
  );
}
