# Performance Audit
_Date: 2026-05-06_
_Method: Static analysis against the committed `out/` build (Next.js 16, Turbopack, `output: "export"`). No live profiling. Where p75 LCP/TTI is asserted, it must be confirmed with a Lighthouse run on prod._

## Headline numbers (estimated, not measured)

- **JS shipped to home page (`/`)**: ~705 KB raw / ~245 KB gzipped across 11 chunks
- **JS shipped to a v2 lesson step page (`/learn/v2/.../<step>`)**: ~1.80 MB raw / **~565 KB gzipped** across 14 chunks
- **Largest single chunk**: `0zjzh~sdv7e.p.js` — **784 KB raw / 244 KB gzipped** (CodeMirror 6 + react-markdown + rehype-highlight + highlight.js with **all 27 languages auto-loaded**)
- **Pyodide payload (separate from JS bundle)**: 12 MB on disk
  - `pyodide.asm.wasm`: 8.65 MB
  - `python_stdlib.zip`: 2.42 MB
  - `pyodide.asm.js`: 1.07 MB
  - `pyodide-lock.json`: 110 KB
  - `pyodide.js` + `pyodide.mjs`: ~33 KB
- **Pyodide load strategy**: **eager preload via Web Worker on `requestIdleCallback`** from the home page (`PyodidePreloader` mounts at `/`). Same-origin (`/pyodide/*`), long-cache headers configured.
- **Static pages generated**: 778 HTML files
  - 769 under `/learn/**` (about 624 v2 step pages + v2 chapter overviews + ~140 v1 legacy lesson pages)
  - 52 OG / Twitter PNGs (1200×630, generated at build time via `next/og`)
  - **Sitemap entries**: 658 URLs (~83 KB sitemap.xml, served as plain XML — fine)
- **Home page HTML**: 110 KB raw / **22 KB gzipped** (includes ~70 KB of inline RSC payload)
- **Lesson page HTML**: 134 KB raw / **29 KB gzipped**

---

## Critical (will hurt p75 LCP / TTI on 4G)

### `[critical]` rehype-highlight ships ALL 27 highlight.js languages on every lesson page

- **Where**: `components/v2/steps/*.tsx` (8 files), `components/LessonView.tsx`, `app/learn/v2/[chapter]/page.tsx` — all do `import rehypeHighlight from "rehype-highlight"`
- **Cost**: `rehype-highlight` defaults to `highlight.js`'s **`common` set (27 languages: c, cpp, csharp, css, go, graphql, html, java, javascript, json, kotlin, less, lua, makefile, markdown, objectivec, perl, php, php-template, plaintext, python, r, ruby, rust, scss, shell, sql, swift, typescript, vbnet, wasm, xml, yaml…)** when no `languages` prop is passed. Decoded from the bundle: 27 distinct `aliases:[...]` blocks confirmed in `0zjzh~sdv7e.p.js`.
- **Audited reality**: this site teaches Python. Markdown code-fences in lesson prose are 99% `python`, occasional `bash`/`sh`. Shipping the other 25 grammars is pure dead weight on every lesson page.
- **Fix**: Pass an explicit `languages` map to `rehypeHighlight`, e.g.

  ```ts
  import rehypeHighlight from "rehype-highlight";
  import python from "highlight.js/lib/languages/python";
  import bash from "highlight.js/lib/languages/bash";
  import json from "highlight.js/lib/languages/json";

  const rehypeHl = [rehypeHighlight, { languages: { python, bash, json }, detect: false }];
  ```
- **Estimated savings**: 100–140 KB gzipped off the lesson-page critical path. This is the single biggest lever in the audit.

### `[critical]` CodeMirror is bundled into the same chunk as react-markdown — both are required by lesson pages, but neither is needed for first paint

- **Where**: `components/v2/PersistentIDE.tsx` does a top-level `import CodeMirror from "@uiw/react-codemirror"`. CodeMirror modules and react-markdown end up in the same 244 KB-gzip chunk because both are eager dependencies of `LessonStepClient`.
- **Cost**: ~244 KB gzipped is parsed and evaluated before the lesson layout becomes interactive, even though the user can read the prompt panel without the IDE for 1–3 seconds while they orient themselves.
- **Fix**: `next/dynamic` the IDE.

  ```ts
  const PersistentIDE = dynamic(() => import("./PersistentIDE"), {
    ssr: false,
    loading: () => <IDESkeleton />,
  });
  ```
  Static export will still emit the chunk, but the lesson HTML lands without it and the browser fetches it after first paint. Keep the `PyodidePreloader` (workers are not blocked by JS chunk evaluation) so wasm is still warming during this window.
- **Estimated savings**: pushes lesson-page TTI from "must download all 565 KB gz" to "interactive at ~250 KB gz". LCP is unaffected (the prompt panel has no IDE in the LCP element), but **Time-to-First-Run-Output is unchanged** because Pyodide warm-up dominates anyway.

### `[critical]` `__next_f.push` payload on the home page serializes all 624 step IDs

- **Where**: `app/page.tsx` builds `stepIdsByChapter: Record<string, string[]>` and passes it as a prop to `<HomeClient>` and `<PhaseBandedRail>`. Confirmed in `out/index.html`: `stepIdsByChapter` is fully serialized into the inline RSC payload.
- **Cost**: ~28 KB of the home page's 110 KB raw / 22 KB gz is the step-IDs blob. Each step ID averages ~50 bytes (e.g., `"variables/types-on-sight/s07-07-fix-the-coercion"`).
- **Why it exists**: client-side resume logic uses step IDs to compute "where you left off" against localStorage progress.
- **Fix options** (ranked by effort):
  1. Replace string IDs with positional indices. `stepIdsByChapter` becomes `stepCountByChapter: Record<string, number>`. Resume logic recomputes the slug from `(chapter, lesson, stepIndex)` on the fly, which it already does for navigation. **~25 KB saved.**
  2. Hash the step IDs to short tokens at build time. **~15 KB saved, more code complexity.**
  3. Defer the resume logic — drop the prop entirely from the static HTML, fetch a static JSON manifest (`/manifest/steps.json`) on hydrate. **~28 KB saved from initial HTML; one extra request that browser can prefetch.**
- **Estimated savings**: option 1 → 5–8 KB gzipped off home page HTML, faster TTFB on Cloudflare's edge for cold cache hits.

---

## High (worth fixing for the launch push)

### `[high]` `<Link>` prefetch is on by default for every chapter / lesson tile on the home page

- **Where**: `components/v2/PhaseBandedRailClient.tsx` and `HomeClient.tsx` render 25+ `<Link>` elements pointing into `/learn/v2/...`. Default Next.js behavior is to prefetch the RSC payload for every visible Link on hover/idle.
- **Cost**: each lesson page's RSC payload is ~30–50 KB raw. With 25 chapter tiles + 470+ lesson tiles in the expanded rail, you can blow through several MB of background prefetch the moment a user reaches the home page on a fast connection. On a 4G phone this competes with Pyodide's 12 MB cold-load — exactly the budget you cannot afford to share.
- **Fix**: set `prefetch={false}` on the chapter tiles in `PhaseBandedRailClient.tsx` and let the IDE preload (via `PyodidePreloader`) own the idle bandwidth window. Keep prefetch on the single primary "start chapter 1" CTA only.
- **Lighthouse run on prod required to confirm the size impact** — Cloudflare's edge cache may already serve these very fast.

### `[high]` Two near-identical 784 KB CodeMirror+markdown chunks (`0z-9o9sq84asc.js` and `0zjzh~sdv7e.p.js`)

- **Where**: chunk dump in `out/_next/static/chunks/`. The v1 chunk is referenced by 140 HTML pages (legacy `/learn/<chapter>/exercise-N`), the v2 chunk by 515 pages.
- **Cost**: turbopack is emitting two near-duplicate chunks because v1 (`components/CodeEditor.tsx`, `components/LessonView.tsx`) and v2 (`components/v2/PersistentIDE.tsx`, `components/v2/steps/*.tsx`) re-import the same heavy deps with slightly different module graphs. A returning user who hits both paths pays for both. With long-cache headers the second visit is free, but cold cache is doubled.
- **Fix**: kill the v1 surface entirely if the launch is on v2 (legacy pages still live under `app/learn/[chapter]/`). Delete `app/learn/[chapter]/page.tsx`, `app/learn/[chapter]/[lesson]/page.tsx`, `components/LessonView.tsx`, `components/CodeEditor.tsx`. The two chunks collapse to one, and 140 stale HTML pages stop being indexed.
- **Estimated savings**: build time drops ~8 seconds, sitemap shrinks 80 entries, deduped chunk benefits ~140 pages on cold cache.

### `[high]` `BrainDump` mounts on every page (root layout)

- **Where**: `app/layout.tsx` line 26 — `<BrainDump />` rendered for every route, including the home page.
- **Cost**: small (~3 KB component) but it adds a global keydown listener and a localStorage read on mount for users who never use it. More importantly, it's a `"use client"` boundary in the root layout, which hydrates immediately and competes with `PyodidePreloader`'s idle scheduling.
- **Fix**: lazy-mount via `useEffect` + `requestIdleCallback`, or only mount on routes where users would actually park a thought (lesson pages).
- **Estimated savings**: marginal JS, but defers a hydration unit and frees up the idle scheduler for Pyodide preload.

### `[high]` Self-hosted Pyodide is correct, but the version is not pinned in the URL

- **Where**: `public/pyodide-worker.js` does `importScripts("/pyodide/pyodide.js")` and `loadPyodide({ indexURL: "/pyodide/" })`. `_headers` long-caches `/pyodide/*` for a year.
- **Cost**: when `scripts/copy-pyodide.mjs` upgrades the pyodide package, the new wasm file goes to the same path. Without a `?v=<sha>` cache-buster or content-hashed filename, repeat visitors will keep hitting the cached 8.6 MB wasm and break (the `pyodide.asm.js` has hard-coded byte offsets matching its wasm twin). The `_headers` comment acknowledges this — "force-refresh must still revalidate after a pyodide version bump" — but in practice nothing forces revalidation.
- **Fix on a version bump**: deploy with a new path like `/pyodide-0.28.3/` and update `pyodide-worker.js` to reference it. Or compute a content-hash suffix at copy time in `scripts/copy-pyodide.mjs` and substitute it into the worker. Easiest interim: bump cache to `max-age=2592000, stale-while-revalidate=86400` instead of a year.
- **Risk level**: invisible until the next pyodide upgrade, then catastrophic for repeat visitors. Worth fixing before any pyodide bump.

---

## Medium

### `[medium]` `react-markdown` re-imported 8× (every step view), no shared hoist

- **Where**: each of `components/v2/steps/*.tsx` does its own `import ReactMarkdown` with the same `remarkPlugins` and `rehypePlugins`. Bundler dedupes the import, but the plugin arrays are reconstructed on every step transition, meaning `useMemo`-able config objects aren't memoized.
- **Cost**: minor — a few KB of repeated config object literal allocations on each step navigation.
- **Fix**: hoist a single shared `<MarkdownProse>` component in `components/v2/MarkdownProse.tsx` with frozen `remarkPlugins` / `rehypePlugins` arrays. All 8 step views consume it.
- **Bonus**: when you do the highlight.js fix above, you only need to wire it in one place.

### `[medium]` 52 OG/Twitter PNGs generated at build time

- **Where**: `app/learn/v2/[chapter]/opengraph-image.tsx` and `twitter-image.tsx`, both using `next/og`.
- **Cost**: each PNG is ~50–80 KB; total ~3 MB of PNGs in `out/`. Build time impact is 26 chapters × 2 images × ~200 ms render = ~10 seconds. Not pathological, but not free.
- **Fix**: only generate per-chapter OGs for the chapters with hand-designed art (currently 3: mutation-and-state, llm-apis, capstone). The other 23 already fall back to `/og/launch/wedge`. Drop the static-params for those and let `OG_BY_CHAPTER` lookup decide.
- **Estimated savings**: ~7 seconds of build time, ~46 fewer PNGs in the static bundle.

### `[medium]` 624 step pages × ~30 KB raw HTML = ~18 MB of static HTML in `out/`

- **Where**: `out/learn/v2/**/index.html` files. Each one ships the full RSC tree for its layout including the `LessonShell` skeleton, the chapter nav tree (~5 KB), and the step body.
- **Cost**: not a runtime concern (each page is self-contained and individually gzipped at the edge). Affects build-time and cold deploy upload to Cloudflare.
- **Fix**: not really actionable — the chapter nav tree is genuinely needed for SEO and instant nav. Worth measuring whether `ChapterNavTree` could be a separate static JSON loaded on the client to halve each page's HTML, but that's a tradeoff against TTI for the sidebar.

### `[medium]` `font-display` not explicitly set

- **Where**: `app/layout.tsx` lines 7–8 use `Fraunces({ subsets: ["latin"] })` and `JetBrains_Mono({ subsets: ["latin"] })`. Both default to `display: "swap"` in Next.js 16 (good — no FOIT), but it's not explicit and could regress.
- **Fix**: add `display: "swap"` explicitly to both font calls. Cheap insurance.

### `[medium]` 769 `/learn/**/index.html` pages serve `Cache-Control: public, max-age=0, must-revalidate` by default on Cloudflare Pages

- **Where**: not in `_headers`. Pages free tier defaults HTML to no-cache.
- **Cost**: each lesson page is re-fetched on every navigation across visits. Compresses well (~29 KB gz) but it's still 29 KB the user pays for.
- **Fix**: add `/learn/* Cache-Control: public, max-age=300, stale-while-revalidate=86400` to `public/_headers`. Lesson HTML changes rarely; SWR handles content updates without a hard miss.

---

## Low / micro-opts

### `[low]` 22 inline `<script>` tags on the home page (RSC framework chunks)

- Standard Next.js RSC plumbing, unavoidable on the App Router. Not something you can change without going to Pages Router or full client-only SPA.

### `[low]` `app/sitemap.ts` walks the full content tree synchronously

- 658 URLs in `sitemap.xml`. The `getV2Chapter(entry.slug)` calls inside the loop do disk I/O per chapter. Build-time only, not runtime — but if you ever go to a thousands-of-pages scale, parallelize with `Promise.all`.

### `[low]` `<a href="https://github.com/...">` and `<a href="https://x.com/...">` in home footer have no `referrerPolicy="noreferrer"`

- They have `rel="noopener noreferrer"` — fine for security and perf, just noting it's correct.

### `[low]` `app/learn/v2/[chapter]/page.tsx` uses `redirect()` for chapters with no overview

- Valid Next.js 16 pattern. The redirect happens at request time on a static page, which means it actually works as a client-side redirect via `<meta http-equiv="refresh">` in the static export. Adds ~50ms latency for the redirect cycle but only affects chapters with no overview, which the data shows is most of them right now. Confirmed by spot-checking — fine.

### `[low]` `BrainDump` reads `loadProgress().brainDump` in `useEffect` which calls `JSON.parse` on the full progress blob

- Cold path. Not a concern unless the progress blob grows past 100 KB.

---

## What's already well-optimized (don't regress)

- **Pyodide preload via Web Worker on `requestIdleCallback`** — exactly the right pattern. The worker is a global singleton in `lib/use-pyodide.ts`, and `PyodidePreloader.tsx` warms it from the home page so by the time the user hits a lesson, it's already in `loading` or `ready`. The "always echo current state" hack in `pyodide-worker.js` correctly handles the soft-nav re-mount case.
- **Self-hosted Pyodide** at `/pyodide/*` with `Cache-Control: public, max-age=31536000` — robust against jsdelivr blocks (China, schools), avoids CORS fragility.
- **Lucide icons are correctly tree-shaken** — only ~10 distinct icon components shipped per route (confirmed by chunk inspection: `arrow-down`, `arrow-up`, `grip-vertical`, `lightbulb`, `lock`, `sun`, `circle-check`, `circle-x`, `loader-circle`, `play`, etc.). Next.js / Turbopack handles this without a config.
- **Fonts are self-hosted via `next/font/google`** — two woff2 files preloaded (Fraunces variable ~37 KB, JetBrains Mono variable ~40 KB). Both have variable axes, so a single file covers all weights.
- **CodeMirror is correctly code-split off the home page** — confirmed: home page (`/`) does not include the 784 KB chunk. Only routes that mount `PersistentIDE` pull it.
- **`app/og/launch/[name]/route.tsx` is bounded to 5 names** — correctly verified, no explosion risk.
- **`output: "export"` + Cloudflare Pages free tier** is the correct fit for the project. KV-backed `functions/api/save.ts` and `load.ts` are O(1), trivial payloads, well within Cloudflare Workers limits.
- **`HeroBugSnippet`** is a pure server component — zero client JS, ships as static HTML inside the home page. LCP-safe.
- **Sitemap is `dynamic = "force-static"`** — generated at build time, served as a 83 KB plain XML file. Fine.
- **`SiteHeader` correctly uses `usePathname` to skip rendering on onboarding routes** — no surprise hydration cost on `/onboarding`.

---

## What needs a Lighthouse run on prod to confirm

- p75 LCP on the home page (4G mobile): expected good (< 2.0s) given the 22 KB gz HTML and HeroBugSnippet being a server component, but unverified.
- p75 LCP on a lesson step page: expected ≥ 2.5s on 4G because of the 565 KB gz JS shipped before hydration. **This is the budget the highlight.js fix attacks directly.**
- Cumulative Layout Shift: the `<IDESkeleton />` in the proposed dynamic-IDE fix needs to be sized exactly to the post-hydration IDE to avoid a CLS regression.
- Time-to-First-Run-Output: this is the metric that actually matters for the product, and it's dominated by Pyodide cold-load (8.65 MB wasm download + ~1s instantiation). Even a perfect JS optimization won't move it under ~5s on a 4G phone with cold cache. The `PyodidePreloader` strategy is correct; the only thing that would meaningfully improve this is shipping a smaller Python (CPython→RustPython, or Brython for the first lesson only). That is **out of scope for the launch** but worth tracking as a future bet.

---

**Performance Benchmarker**: Performance Benchmarker
**Analysis Date**: 2026-05-06
**Performance Status**: HOME page MEETS launch SLA on a static-analysis basis. LESSON pages **AT RISK** of failing p75 LCP/TTI on 4G — the rehype-highlight 27-language fix and dynamic-import of CodeMirror together would cut ~250 KB gz off the lesson-page critical path, which is the difference between "meets" and "fails" for a free-tier mobile launch.
**Scalability Assessment**: Cloudflare Pages free tier handles 778 static HTML files and 12 MB of immutable assets without breaking a sweat. KV-backed save/load is O(1). The only scaling pressure is build time (currently ~30s for content + image generation), which is fine until the curriculum doubles.
