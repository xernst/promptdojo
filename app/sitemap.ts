import type { MetadataRoute } from "next";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";

const SITE = "https://promptdojo.dev";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const toc = getV2Toc();
  // Single timestamp per build — Google needs lastModified on every entry
  // or it deprioritizes the whole sitemap. Per launch-week SEO audit.
  const now = new Date();
  const out: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/curriculum/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/pro/`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE}/privacy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/changelog/`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/roast/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    // AEO surface added 2026-05-11 — comparison + AI-bug catalog pages.
    { url: `${SITE}/ai-bugs/`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE}/vs/scrimba/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/vs/real-python/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/vs/codecademy/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  for (const entry of toc.chapters) {
    const detail = await getV2Chapter(entry.slug);
    if (!detail) continue;
    out.push({
      url: `${SITE}/learn/v2/${entry.slug}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
    for (const lesson of detail.lessons) {
      for (let i = 0; i < lesson.steps.length; i++) {
        out.push({
          url: `${SITE}/learn/v2/${entry.slug}/${lesson.slug}/${i}/`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return out;
}
