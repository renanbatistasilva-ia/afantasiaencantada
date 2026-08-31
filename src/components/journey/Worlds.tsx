import Link from "next/link";
import Arch from "@/components/fx/Arch";
import PortalLink from "@/components/fx/PortalLink";
import Reveal from "@/components/fx/Reveal";
import ChapterMark from "./ChapterMark";
import { visibleWorlds } from "@/data/worlds";
import { charactersOfWorld } from "@/data/characters";
import styles from "./Worlds.module.css";

export default function Worlds() {
  return (
    <section id="mundos" className={styles.section}>
      <ChapterMark
        numeral="II"
        name="A escolha"
        title="Escolha um mundo"
        lede="Cada criança guarda um universo favorito. Encontre o dela: os personagens moram logo ali dentro."
        tone="dark"
      />

      <div className={styles.portals}>
        {visibleWorlds.map((world, i) => {
          const residents = charactersOfWorld(world.slug);
          const flip = i % 2 === 1;
          return (
            <article
              key={world.slug}
              data-scene={world.slug}
              className={`${styles.panel} ${flip ? styles.flip : ""}`}
              style={
                {
                  background: world.atmosphere.bg,
                  "--w-ink": world.atmosphere.ink,
                  "--w-accent": world.atmosphere.accent,
                  "--w-glow": world.atmosphere.glow,
                } as React.CSSProperties
              }
            >
              <div className={styles.panelGlow} aria-hidden="true" />

              <Reveal variant="bloom" className={styles.portalCol}>
                {world.cover ? (
                  <PortalLink
                    href={`/mundos/${world.slug}`}
                    color={world.atmosphere.accent}
                    glow={world.atmosphere.glow}
                    className={styles.portalLink}
                    ariaLabel={`Entrar no mundo ${world.name}`}
                  >
                    <Arch
                      src={world.cover.src}
                      alt={world.cover.alt}
                      position={world.cover.position}
                      className={styles.arch}
                    />
                  </PortalLink>
                ) : (
                  <PortalLink
                    href={`/mundos/${world.slug}`}
                    color={world.atmosphere.accent}
                    glow={world.atmosphere.glow}
                    className={`${styles.portalLink} ${styles.archEmpty}`}
                    ariaLabel={`Entrar no mundo ${world.name}`}
                  >
                    <span className={styles.archStar} aria-hidden="true">
                      ✦
                    </span>
                    <span className={styles.archNames}>
                      {residents.slice(0, 4).map((c) => (
                        <em key={c.slug}>{c.name}</em>
                      ))}
                    </span>
                    <span className={styles.archSoon}>fotos chegando ao reino</span>
                  </PortalLink>
                )}
              </Reveal>

              <div className={styles.copyCol}>
                <Reveal variant={flip ? "drift-left" : "drift-right"}>
                  <p className={styles.count}>
                    Mundo {String(i + 1).padStart(2, "0")} · {String(visibleWorlds.length).padStart(2, "0")}
                  </p>
                  <h3 className={`display ${styles.name}`}>{world.name}</h3>
                  <p className={`script ${styles.tagline}`}>{world.tagline}</p>
                  <p className={styles.invite}>{world.invite}</p>
                </Reveal>

                <Reveal delay={0.12} variant={flip ? "drift-left" : "drift-right"}>
                  <p className={styles.residents}>
                    {residents.map((c, j) => (
                      <span key={c.slug}>
                        {c.name}
                        {j < residents.length - 1 && (
                          <span className={styles.sep} aria-hidden="true">
                            {" ✦ "}
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                  <Link href={`/mundos/${world.slug}`} className={styles.enter}>
                    Entrar neste mundo
                    <span aria-hidden="true" className={styles.enterArrow}>
                      →
                    </span>
                  </Link>
                </Reveal>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
