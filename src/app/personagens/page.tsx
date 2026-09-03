import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import Footer from "@/components/site/Footer";
import CharacterMedallion from "@/components/character/CharacterMedallion";
import { charactersOfWorld } from "@/data/characters";
import { visibleWorlds } from "@/data/worlds";
import styles from "./elenco.module.css";

const BASE = "https://afantasiaencantada.com";

export const metadata: Metadata = {
  title: "Todos os personagens — Fantasia Encantada",
  description:
    "Princesas, heróis, mascotes, estrelas do pop e personagens brasileiros para festas infantis em São Paulo. Conheça o elenco completo.",
  alternates: { canonical: `${BASE}/personagens` },
  openGraph: {
    title: "Todos os personagens — Fantasia Encantada",
    description:
      "Conheça o elenco completo de personagens vivos para festas infantis em São Paulo.",
    url: `${BASE}/personagens`,
    siteName: "Fantasia Encantada",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "Fantasia Encantada" }],
  },
};

export default function ElencoPage() {
  // Agrupado por mundo: é o mesmo modelo mental que a home e o formulário usam.
  const mundos = visibleWorlds
    .map((world) => ({ world, cast: charactersOfWorld(world.slug) }))
    .filter(({ cast }) => cast.length > 0);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Reveal>
          <Link href="/" className={styles.back}>
            ← início
          </Link>
          <h1 className={`display ${styles.title}`}>
            Todos os <span className={`script ${styles.titleScript}`}>personagens</span>
          </h1>
          <p className={styles.lede}>
            Princesas, heróis, mascotes e estrelas do pop. Toque em qualquer um para conhecer a
            história dele e reservar uma visita.
          </p>
        </Reveal>
      </header>

      {mundos.map(({ world, cast }) => (
        <section key={world.slug} className={styles.worldBlock}>
          <Reveal>
            <div className={styles.worldHead}>
              <h2 className={`script ${styles.worldName}`}>{world.name}</h2>
              <Link href={`/mundos/${world.slug}`} className={styles.worldLink}>
                ver o mundo →
              </Link>
            </div>
          </Reveal>

          <ul className={styles.grid}>
            {cast.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={Math.min(i * 0.04, 0.24)}>
                  <Link href={`/personagens/${c.slug}`} className={styles.card}>
                    <span className={styles.thumb}>
                      {c.photos[0] ? (
                        <Image
                          src={c.photos[0].src}
                          alt=""
                          fill
                          sizes="(max-width: 860px) 40vw, 15vw"
                          style={{ objectFit: "cover", objectPosition: c.photos[0].position }}
                        />
                      ) : (
                        <CharacterMedallion character={c} size={96} />
                      )}
                    </span>
                    <span className={styles.cardName}>{c.name}</span>
                    <span className={styles.cardBlurb}>{c.blurb}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Footer />
    </main>
  );
}
