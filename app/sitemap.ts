import type { MetadataRoute } from "next";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";

const SITE = "https://promptdojo.dev";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const toc = getV2Toc();
  const out: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/curriculum`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/changelog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/roast`, changeFrequency: "monthly", priority: 0.9 },
  ];

  for (const entry of toc.chapters) {
    const detail = await getV2Chapter(entry.slug);
    if (!detail) continue;
    out.push({
      url: `${SITE}/learn/v2/${entry.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });
    for (const lesson of detail.lessons) {
      for (let i = 0; i < lesson.steps.length; i++) {
        out.push({
          url: `${SITE}/learn/v2/${entry.slug}/${lesson.slug}/${i}`,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return out;
}
