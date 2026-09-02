import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/fx/Reveal";
import Sparkles from "@/components/fx/Sparkles";
import Footer from "@/components/site/Footer";
import WorldCharacters from "@/components/character/WorldCharacters";
import { visibleWorlds, worldBySlug } from "@/data/worlds";
import { charactersOfWorld } from "@/data/characters";
import styles from "./world.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return visibleWorlds.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const world = worldBySlug(slug);
  if (!world) return {};
  const title = `${world.name} — Fantasia Encantada`;
  const description = `${world.tagline} ${world.invite} Personagens vivos para festas infantis em São Paulo.`;
  const url = `https://afantasiaencantada.com/mundos/${world.slug}`;
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
      images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: world.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-v2.jpg"],
    },
  };
}

export default async function WorldPage({ params }: Props) {
  const { slug } = await params;
  const world = worldBySlug(slug);
  if (!world) notFound();

  const residents = charactersOfWorld(world.slug);
  const withPhotos = residents.filter((c) => c.photos.length > 0);
  const awaitingPhotos = residents.filter((c) => c.photos.length === 0);
  const isNight = world.atmosphere.mood === "night";

  return (
    <main
      className={styles.page}
      style={
        {
          background: world.atmosphere.bg,
          "--w-ink": world.atmosphere.ink,
          "--w-accent": world.atmosphere.accent,
          "--w-glow": world.atmosphere.glow,
        } as React.CSSProperties
      }
    >
      {isNight && <Sparkles density={1.2} color="233, 206, 156" />}

      <header className={styles.hero}>
        <Reveal>
          <Link href="/#mundos" className={styles.back}>
            ← todos os mundos
          </Link>
          <h1 className={`display ${styles.title}`}>{world.name}</h1>
          <p className={`script ${styles.tagline}`}>{world.tagline}</p>
          <p className={styles.invite}>{world.invite}</p>
        </Reveal>
      </header>

      <WorldCharacters
        world={world}
        withPhotos={withPhotos}
        awaitingPhotos={awaitingPhotos}
      />

      <div className={styles.bookBar}>
        <Link
          href={`/reservar?mundo=${world.slug}`}
          className={`btn btn-ouro ${styles.bookCta}`}
        >
          Reservar uma visita deste mundo
        </Link>
      </div>

      <Footer />
    </main>
  );
}
