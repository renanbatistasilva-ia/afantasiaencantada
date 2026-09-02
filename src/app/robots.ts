import type { MetadataRoute } from "next";

// Obrigatório com output: "export" — sem isto o build falha ao coletar a rota.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://afantasiaencantada.com/sitemap.xml",
    host: "https://afantasiaencantada.com",
  };
}
