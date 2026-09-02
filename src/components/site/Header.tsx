"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [tinted, setTinted] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setTinted(y > 40);
      setHidden(y > 140 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${hidden ? styles.hidden : ""} ${tinted ? styles.tinted : ""}`}
    >
      <Link href="/" className={styles.wordmark}>
        <Image
          src="/images/marca/logo-header-tight.png"
          alt="Fantasia Encantada"
          width={360}
          height={188}
          priority
          className={styles.logoImg}
        />
      </Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        <Link href="/#mundos" className={styles.navLink}>
          Mundos
        </Link>
        <Link href="/#momentos" className={styles.navLink}>
          Momentos
        </Link>
        <Link href="/reservar" className={`btn btn-ouro ${styles.cta}`}>
          Reservar
        </Link>
      </nav>
    </header>
  );
}
