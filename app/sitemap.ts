import type { MetadataRoute } from "next";
import { TOOLS } from "@/registry/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jsonwiz.dev";

  const toolEntries = TOOLS.map((tool) => ({
    url: `${base}/tools/${tool.slug}`,
    lastModified: new Date(tool.dateAdded),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolEntries,
  ];
}
