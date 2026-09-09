import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import Sparkles from "@/components/fx/Sparkles";
import styles from "./reservar.module.css";

const BASE = "https://afantasiaencantada.com";

const titulo = "Reservar uma visita — Fantasia Encantada";
const descricao =
  "Escolha o personagem, a data e conte sobre a estrela da festa. A reserva termina no WhatsApp, com nossa equipe.";

export const metadata: Metadata = {
  title: titulo,
  description: descricao,
  // Era a única rota indexável sem canonical. E o og:url herdava o do layout,
  // que é a home — quem compartilhava o link da reserva no WhatsApp via a
  // página inicial aparecer na prévia.
  alternates: { canonical: `${BASE}/reservar/` },
  // Atenção: `openGraph` aninhado SUBSTITUI o do layout inteiro, não mistura
  // campo a campo. Quando esta chave nasceu, só com url/title/description, ela
  // levou junto o `images`, o `siteName`, o `locale` e o `type` — e a página de
  // reserva, que é a mais compartilhada no WhatsApp, ficou sem prévia nenhuma.
  // Se mexer aqui, repita os campos herdados.
  openGraph: {
    url: `${BASE}/reservar/`,
    title: titulo,
    description: descricao,
    siteName: "Fantasia Encantada",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "Fantasia Encantada" }],
  },
};

export default function ReservarPage() {
  return (
    <main className={styles.page}>
      <Sparkles density={1.2} />
      {/*
        Sem <Suspense> de propósito.
        O formulário lia `?personagem=` e `?mundo=` por useSearchParams, o que
        obrigava este limite — e com exportação estática ele não renderiza nada:
        o HTML saía com 197 bytes e zero texto visível. Agora o formulário lê o
        endereço direto do navegador, então a escolha de personagem vai para o
        HTML: o buscador enxerga os 28 nomes e o visitante não encara uma tela
        em branco esperando o JavaScript.
      */}
      <BookingWizard />
    </main>
  );
}
