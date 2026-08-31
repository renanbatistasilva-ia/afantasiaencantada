import { quickMessage, whatsappUrl } from "@/lib/whatsapp";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <p className={`script ${styles.wordmark}`}>Fantasia Encantada</p>
        <p className={styles.tag}>
          Personagens que encantam, momentos que ficam para sempre.
        </p>
        <nav className={styles.links} aria-label="Contato e redes">
          <a
            href="https://instagram.com/afantasiaencantada"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram · @afantasiaencantada
          </a>
          <span className={styles.dot} aria-hidden="true">
            ✦
          </span>
          <a href={whatsappUrl(quickMessage)} target="_blank" rel="noopener noreferrer">
            WhatsApp · (11) 93223-7456
          </a>
        </nav>
      </div>
      <div className={styles.bottom}>
        <p>São Paulo e região · atendemos festas, escolas e eventos</p>
        <p className={styles.legal}>
          © {new Date().getFullYear()} Fantasia Encantada. Personagens
          inspirados em contos clássicos e universos queridos pelas crianças.
        </p>
      </div>
    </footer>
  );
}
