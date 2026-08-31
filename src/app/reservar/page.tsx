import type { Metadata } from "next";
import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import Sparkles from "@/components/fx/Sparkles";
import styles from "./reservar.module.css";

export const metadata: Metadata = {
  title: "Reservar uma visita — Fantasia Encantada",
  description:
    "Escolha o personagem, a data e conte sobre a estrela da festa. A reserva termina no WhatsApp, com nossa equipe.",
};

export default function ReservarPage() {
  return (
    <main className={styles.page}>
      <Sparkles density={1.2} />
      {/* personagem/mundo são lidos no cliente (useSearchParams) para funcionar
          em host estático. Suspense é exigido em torno de useSearchParams. */}
      <Suspense>
        <BookingWizard />
      </Suspense>
    </main>
  );
}
