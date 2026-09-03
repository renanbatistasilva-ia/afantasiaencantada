import Link from "next/link";
import Arch from "@/components/fx/Arch";
import LiveStage from "@/components/fx/LiveStage";
import Reveal from "@/components/fx/Reveal";
import type { Character, World } from "@/data/types";
import CharacterMedallion from "./CharacterMedallion";
import styles from "@/app/mundos/[slug]/world.module.css";

interface Props {
  world: World;
  withPhotos: Character[];
  awaitingPhotos: Character[];
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default function WorldCharacters({ world, withPhotos, awaitingPhotos }: Props) {
  const glowRgb = hexToRgb(world.atmosphere.glow);

  return (
    <>
      {withPhotos.length > 0 && (
        <section className={styles.cast} aria-label="Personagens deste mundo">
          {withPhotos.map((c, i) => (
            <article key={c.slug} className={`${styles.member} ${i % 2 ? styles.flip : ""}`}>
              <Reveal className={styles.memberPhotos}>
                <Link
                  href={`/personagens/${c.slug}`}
                  className={styles.photoButton}
                  aria-label={`Conhecer a história de ${c.name}`}
                >
                  <LiveStage
                    src={c.photos[0].src}
                    alt={c.photos[0].alt}
                    position={c.photos[0].position}
                    glow={glowRgb}
                    intensity={0.9}
                    className={styles.mainArch}
                    sizes="(max-width: 860px) 88vw, 42vw"
                  />
                </Link>
                {c.photos[1] && (
                  <div className={styles.echoFrame}>
                    <Arch
                      src={c.photos[1].src}
                      alt={c.photos[1].alt}
                      position={c.photos[1].position}
                      parallax={3}
                      className={styles.echoArch}
                      sizes="(max-width: 860px) 40vw, 18vw"
                    />
                  </div>
                )}
              </Reveal>
              <Reveal delay={0.1} className={styles.memberCopy}>
                <Link href={`/personagens/${c.slug}`} className={styles.nameButton}>
                  <h2 className={`display ${styles.memberName}`}>{c.name}</h2>
                </Link>
                <p className={styles.memberBlurb}>{c.blurb}</p>
                <Link href={`/personagens/${c.slug}`} className={styles.memberCta}>
                  Conheça a história <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </article>
          ))}
        </section>
      )}

      {awaitingPhotos.length > 0 && (
        <section className={styles.roster}>
          <Reveal>
            <h2 className={`script ${styles.rosterTitle}`}>
              {withPhotos.length > 0 ? "Também moram aqui" : "Quem mora aqui"}
            </h2>
          </Reveal>
          <ul className={styles.rosterList}>
            {awaitingPhotos.map((c, i) => (
              <li key={c.slug} className={styles.rosterItem}>
                <Reveal delay={Math.min(i * 0.05, 0.3)}>
                  <Link href={`/personagens/${c.slug}`} className={styles.rosterLink}>
                    <CharacterMedallion character={c} size={46} className={styles.rosterMedal} />
                    <span className={styles.rosterName}>{c.name}</span>
                    <span className={styles.rosterBlurb}>{c.blurb}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className={styles.rosterNote}>
            Toque em cada personagem para conhecer a história. As fotos oficiais
            estão a caminho.
          </p>
        </section>
      )}

    </>
  );
}
