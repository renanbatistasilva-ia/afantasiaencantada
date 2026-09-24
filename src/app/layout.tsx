import type { Metadata, Viewport } from "next";
import { Fraunces, Parisienne, Figtree } from "next/font/google";
import "./globals.css";
import AmbientStage from "@/components/fx/AmbientStage";
import Vitrine from "@/components/site/Vitrine";
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
  logo: "https://afantasiaencantada.com/images/marca/logo-alpha.webp",
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
  // 24 horas, que é o que o perfil do Google Meu Negócio declara — a mensagem
  // chega a qualquer hora e é respondida. Aqui dizia 09:00–21:00, e informação
  // divergente entre o site e o perfil enfraquece o resultado na busca local.
  // 00:00–23:59 é a convenção do schema.org para o dia inteiro.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  // O Google usa isto para ligar o site aos perfis. O do Meu Negócio não entra
  // aqui: `sameAs` é para perfis em outros serviços, e a ficha do próprio Google
  // ele já sabe qual é.
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
        <AmbientStage />
        <Vitrine>
          <PortalProvider>{children}</PortalProvider>
        </Vitrine>
      </body>
    </html>
  );
}
