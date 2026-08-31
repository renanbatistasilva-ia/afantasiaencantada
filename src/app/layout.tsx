import type { Metadata, Viewport } from "next";
import { Fraunces, Parisienne, Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import AmbientStage from "@/components/fx/AmbientStage";
import MagicDust from "@/components/fx/MagicDust";
import CurtainIntro from "@/components/site/CurtainIntro";
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
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Fantasia Encantada" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasia Encantada",
    description:
      "Personagens que encantam, momentos que ficam para sempre. Reserve uma visita mágica.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#251629",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body>
        <AmbientStage />
        <MagicDust />
        <CurtainIntro />
        <Header />
        <PortalProvider>{children}</PortalProvider>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
