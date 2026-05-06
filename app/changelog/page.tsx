// /changelog — the prose version of git history. Static export friendly:
// reads content/changelog.md at build time via fs/promises and bundles
// it into the resulting HTML. No client JS required.
//
// Per design-kit/audit-v2/HEADOFIT-plan.md PR 6.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "changelog · promptdojo",
  description:
    "what shipped, when. the prose version of github commits — readable, dated, lowercase.",
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogPage() {
  const md = await readFile(
    join(process.cwd(), "content", "changelog.md"),
    "utf8",
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link href="/" className="dojo-btn-tertiary">
        ← home
      </Link>
      <article className="prose prose-invert mt-6 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </article>
    </main>
  );
}
