// Renders structured data (JSON-LD) as a <script type="application/ld+json"> tag.
// Per launch-week SEO audit 2026-05-11: prior to this, the site had zero
// structured data, which is the single biggest miss for AI-search citation
// (Google AI Overviews, ChatGPT browse-mode, and Perplexity all preferentially
// lift schema-marked content).
//
// SAFETY: dangerouslySetInnerHTML is the documented pattern for JSON-LD in
// Next.js (https://nextjs.org/docs/app/guides/json-ld). The content is
// author-authored schema objects, never user input. We additionally escape
// the `<` character to `<` so a stray "</script>" anywhere in the data
// graph can't terminate the tag early. JSON.stringify already escapes the
// other dangerous characters.
//
// Usage:
//   <JsonLd data={{ "@context": "https://schema.org", "@type": "Course", ... }} />
//
// Pass either one object or an array; an array consolidates into a single
// @graph script tag (Google's preferred shape for multi-schema pages).

type SchemaObject = Record<string, unknown>;

function serialize(value: SchemaObject | SchemaObject[]): string {
  const payload = Array.isArray(value)
    ? { "@context": "https://schema.org", "@graph": value }
    : value;
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: { data: SchemaObject | SchemaObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

// ─── shared schemas ───────────────────────────────────────────────────────

export const SITE_URL = "https://promptdojo.dev";

export const ORG_SCHEMA: SchemaObject = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: "promptdojo",
  url: SITE_URL,
  logo: `${SITE_URL}/apple-icon.png`,
  sameAs: [
    "https://x.com/TFisPython",
    "https://github.com/xernst/promptdojo",
  ],
};

export const WEBSITE_SCHEMA: SchemaObject = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#site`,
  url: SITE_URL,
  name: "promptdojo",
  description:
    "free runnable python school for people who already use ai to write code",
  publisher: { "@id": `${SITE_URL}/#org` },
};
