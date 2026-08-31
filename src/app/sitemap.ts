import type { MetadataRoute } from "next";
import { visibleWorlds } from "@/data/worlds";

export const dynamic = "force-static";

const BASE = "https://afantasiaencantada.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const worldRoutes = visibleWorlds.map((w) => ({
    url: `${BASE}/mundos/${w.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/reservar`, changeFrequency: "monthly", priority: 0.8 },
    ...worldRoutes,
  ];
}
