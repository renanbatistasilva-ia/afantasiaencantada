import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Arch from "@/components/fx/Arch";
import LiveStage from "@/components/fx/LiveStage";
import Reveal from "@/components/fx/Reveal";
import Sparkles from "@/components/fx/Sparkles";
import Footer from "@/components/site/Footer";
import CharacterMedallion from "@/components/character/CharacterMedallion";
import { characterBySlug, visibleCharacters } from "@/data/characters";
import { worldBySlug } from "@/data/worlds";
import styles from "./personagem.module.css";

const BASE = "https://afantasiaencantada.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return visibleCharacters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const character = characterBySlug(slug);
  if (!character) return {};

  const world = worldBySlug(character.worlds[0]);
  const title = `${character.name} para festa infantil — Fantasia Encantada`;
  const description = `${character.blurb} Personagem vivo para festas infantis em São Paulo${
    world ? `, do mundo ${world.name}` : ""
  }.`;
  const url = `${BASE}/personagens/${character.slug}`;
  // A própria foto do personagem vende melhor que a imagem social genérica.
  const image = character.photos[0]?.src ?? "/og-v2.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Fantasia Encantada",
      locale: "pt_BR",
      type: "website",
      images: [{ url: image, alt: character.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CharacterPage({ params }: Props) {
  const { slug } = await params;
  const character = characterBySlug(slug);
  if (!character) notFound();

  const world = worldBySlug(character.worlds[0]);
  const [principal, ...galeria] = character.photos;
  const isNight = world?.atmosphere.mood === "night";

  return (
    <main
      className={styles.page}
      style={
        world
          ? ({
              background: world.atmosphere.bg,
              "--w-ink": world.atmosphere.ink,
              "--w-accent": world.atmosphere.accent,
              "--w-glow": world.atmosphere.glow,
            } as React.CSSProperties)
          : undefined
      }
    >
      {isNight && <Sparkles density={1.1} color="233, 206, 156" />}

      <header className={styles.hero}>
        <Reveal>
          {world && (
            <Link href={`/mundos/${world.slug}`} className={styles.back}>
              ← {world.name}
            </Link>
          )}
          <h1 className={`display ${styles.name}`}>{character.name}</h1>
          <p className={`script ${styles.blurb}`}>{character.blurb}</p>
        </Reveal>
      </header>

      <div className={styles.stageWrap}>
        <Reveal variant="bloom">
          {principal ? (
            <LiveStage
              src={principal.src}
              alt={principal.alt}
              position={principal.position}
              className={styles.stage}
            />
          ) : (
            // Sem foto, o medalhão ilustrado assume — mesmo tratamento do resto do site.
            <div className={styles.medalhaoWrap}>
              <CharacterMedallion character={character} size={200} />
              <p className={styles.semFoto}>As fotos oficiais estão a caminho.</p>
            </div>
          )}
        </Reveal>
      </div>

      <section className={styles.story}>
        <Reveal>
          <p>{character.story}</p>
        </Reveal>
      </section>

      {galeria.length > 0 && (
        <section className={styles.gallery} aria-label={`Fotos de ${character.name}`}>
          {galeria.map((foto, i) => (
            <Reveal key={foto.src} delay={i * 0.08} variant="bloom">
              <Arch
                src={foto.src}
                alt={foto.alt}
                position={foto.position}
                className={styles.galleryItem}
              />
            </Reveal>
          ))}
        </section>
      )}

      <section className={styles.cta}>
        <Reveal className={styles.ctaGroup}>
          <Link href={`/reservar?personagem=${character.slug}`} className={`btn btn-ouro ${styles.mainCta}`}>
            Reservar {character.name}
          </Link>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
