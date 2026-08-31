import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import Sparkles from "@/components/fx/Sparkles";
import ChapterMark from "./ChapterMark";
import { quickMessage, whatsappUrl } from "@/lib/whatsapp";
import styles from "./BookingInvite.module.css";

export default function BookingInvite() {
  return (
    <section className={styles.section} data-scene="convite">
      <Sparkles density={1.8} />
      <ChapterMark
        numeral="V"
        name="O convite"
        title="Toda história precisa de uma data"
        lede="Conte quem seu filho sonha em conhecer e quando essa história vai acontecer. Nós cuidamos de todo o resto."
        tone="dark"
      />

      <Reveal className={styles.actions}>
        <Link href="/reservar" className={`btn btn-ouro ${styles.mainCta}`}>
          Começar a reserva
        </Link>
        <a
          href={whatsappUrl(quickMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aside}
        >
          ou fale direto com a equipe no WhatsApp
        </a>
      </Reveal>

      <p className={styles.note}>
        Sem compromisso: a reserva só é confirmada depois que nossa equipe
        conversa com você.
      </p>
    </section>
  );
}
