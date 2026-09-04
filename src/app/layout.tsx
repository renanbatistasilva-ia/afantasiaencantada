import type { Metadata, Viewport } from "next";
import { Fraunces, Parisienne, Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import AmbientStage from "@/components/fx/AmbientStage";
import MagicDust from "@/components/fx/MagicDust";
import CurtainIntro from "@/components/site/CurtainIntro";
import RegistroDeOrigem from "@/components/site/RegistroDeOrigem";
import Fairy from "@/components/fx/Fairy";
import PortalProvider from "@/components/fx/PortalProvider";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--next-font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const script = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--next-font-script",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--next-font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afantasiaencantada.com"),
  title: "Fantasia Encantada — Personagens vivos para festas",
  description:
    "A magia acontece com personagens vivos. Princesas, heróis, mascotes e estrelas do pop que transformam a festa do seu filho em um conto de fadas. São Paulo e região.",
  openGraph: {
    title: "Fantasia Encantada",
    description:
      "Personagens que encantam, momentos que ficam para sempre. Reserve uma visita mágica.",
    url: "https://afantasiaencantada.com",
    siteName: "Fantasia Encantada",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "Fantasia Encantada" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasia Encantada",
    description:
      "Personagens que encantam, momentos que ficam para sempre. Reserve uma visita mágica.",
    images: ["/og-v2.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#251629",
  width: "device-width",
  initialScale: 1,
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://afantasiaencantada.com/#business",
  name: "Fantasia Encantada",
  description:
    "Personagens vivos para festas infantis em São Paulo. Princesas, heróis, mascotes e estrelas do pop que transformam a festa do seu filho em um conto de fadas.",
  url: "https://afantasiaencantada.com",
  image: "https://afantasiaencantada.com/og-v2.jpg",
  logo: "https://afantasiaencantada.com/images/marca/logo-alpha.png",
  telephone: "+5511932237456",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  areaServed: [
    { "@type": "City", name: "São Paulo" },
    { "@type": "AdministrativeArea", name: "Grande São Paulo" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
  ],
  sameAs: ["https://www.instagram.com/afantasiaencantada"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <RegistroDeOrigem />
        <AmbientStage />
        <MagicDust />
        <Fairy />
        <CurtainIntro />
        <Header />
        <PortalProvider>{children}</PortalProvider>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
