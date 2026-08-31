"use client";

import { usePathname } from "next/navigation";
import { quickMessage, whatsappUrl } from "@/lib/whatsapp";
import styles from "./WhatsAppFloat.module.css";

export default function WhatsAppFloat() {
  const pathname = usePathname();
  // A jornada de reserva já termina no WhatsApp — o botão flutuante seria ruído.
  if (pathname?.startsWith("/reservar")) return null;

  return (
    <a
      href={whatsappUrl(quickMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.float}
      aria-label="Falar com a equipe no WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.18-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.67a8.23 8.23 0 1 1-4.2 15.3l-.3-.18-3.07.89.9-3-.2-.31a8.23 8.23 0 0 1 6.87-12.7Zm-3.1 3.6c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.6.12.17 1.77 2.83 4.38 3.85 2.17.86 2.61.69 3.08.64.47-.04 1.52-.62 1.73-1.22.22-.6.22-1.12.16-1.23-.07-.1-.24-.17-.5-.3-.25-.12-1.52-.75-1.75-.83-.24-.09-.41-.13-.58.12-.17.26-.66.84-.8 1.01-.15.17-.3.19-.55.07a6.87 6.87 0 0 1-2.03-1.26 7.65 7.65 0 0 1-1.4-1.75c-.15-.25-.02-.39.11-.51.11-.12.25-.3.38-.45.13-.15.17-.26.26-.43.08-.17.04-.32-.02-.45-.07-.13-.56-1.4-.79-1.9-.2-.5-.42-.36-.58-.36l-.58-.01Z" />
      </svg>
    </a>
  );
}
