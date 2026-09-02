import type { MetadataRoute } from "next";

// Obrigatório com output: "export" — sem isto o build falha ao coletar a rota.
export const dynamic = "force-static";
import { visibleWorlds } from "@/data/worlds";

const BASE = "https://afantasiaencantada.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const worldEntries = visibleWorlds.map((w) => ({
    url: `${BASE}/mundos/${w.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/reservar`, changeFrequency: "monthly", priority: 0.9 },
    ...worldEntries,
  ];
}
