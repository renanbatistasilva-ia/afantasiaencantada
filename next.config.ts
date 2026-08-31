import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportação estática: gera HTML puro em `out/`, publicável no Cloudflare Pages
  // sem servidor. O site não tem rotas de API, middleware nem dados em runtime.
  output: "export",
  images: {
    // O otimizador on-demand do next/image exige servidor; nossas imagens já
    // são pré-dimensionadas para web, então servimos como estão.
    unoptimized: true,
  },
};

export default nextConfig;
