# Performance Audit

Live target: `https://promptdojo.pages.dev` (Cloudflare Pages, static export, Brotli on, HTTP/2).
Measured 2026-05-06 from a US connection. CF edge: ORD.

## Methodology
- `curl -w` for TTFB / total time / size_download
- `curl -H "Accept-Encoding: br,gzip"` vs `identity` for compression deltas
- Local `out/_next/static/chunks/*` byte counts for raw sizes
- HTML responses fetched + parsed for asset waterfall (script/link tags, preload hints)
- Slow-3G simulated with `--limit-rate 50K` + mobile UA
- LCP / FCP / TTI are **estimates** built from TTFB + parse + render-blocking JS execution time on a baseline desktop. Marked `est.` where applicable.

---

## Current benchmarks

| Route | TTFB | FCP est. | LCP est. | HTML br | JS br (initial) | CSS br | Total initial | Cache (browser) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 0.15 s | ~0.40 s | ~0.65 s | 16.5 KB | 202 KB | 10.7 KB | 331 KB | `max-age=0` (revalidate) |
| `/about/` | 0.22 s | ~0.35 s | ~0.45 s | 7.9 KB | ~95 KB | 10.7 KB | ~217 KB | `max-age=0` |
| `/learn/v2/.../0/` | 0.16 s | ~0.55 s | ~1.4 s | 23.8 KB | 520 KB | 10.7 KB | 668 KB | `max-age=0` |

**Verdicts vs targets:**
- LCP < 1.0 s desktop: `/` and `/about/` PASS; `/learn/...` borderline (Pyodide pulls 5.2 MB compressed in parallel).
- FCP < 0.5 s: PASS for `/about/`, marginal for `/`, lesson misses (large JS parse on critical path).
- TTI < 1.5 s: lesson misses — IDE chunk + markdown chunk + 246 KB framework chunk all execute before interactive.
- **JS budget < 150 KB above-the-fold: FAIL on every route.** Homepage is 202 KB br; lesson 520 KB br.
- CLS: cannot measure from curl; fonts use `font-display: swap` with size-adjust fallbacks (good — minimizes layout shift).
- TTFB: excellent everywhere (Cloudflare edge, ~150 ms).

---

## Per-route waterfall

### `/` (homepage)
```
HTML (16.5 KB br)                       0–150 ms  [TTFB]
├─ preload font Fraunces (40 KB woff2)  parallel, blocking text paint
├─ preload font JetBrains (62 KB woff2) parallel
├─ preload script 0gf4i~5yhco0v.js (9 KB br, fetchPriority=low) prefetch
├─ stylesheet 0p2rz01pihh4z.css (10.7 KB br)   render-blocking
└─ 9× <script> tags (deferred-default since module): 202 KB br total
   ├─ turbopack-runtime    4.3 KB
   ├─ 0v3lyuj75aq50.js    70.8 KB  (React + framework runtime, contains lucide icons)
   ├─ 03~yq9q893hmn.js    40.5 KB  (page client component bundle)
   ├─ 0v9epyrf_9ezc.js    38.6 KB  (shared chunk)
   ├─ 145vedg.q5p3y.js     9.4 KB  (Next.js shell)
   ├─ 028khgf4uqx0..js     9.4 KB
   ├─ 01as9r5n5k.xo.js    13.2 KB  (HomeClient + StreakWidget client component)
   ├─ 0d9oh168~eh8z.js     6.8 KB
   └─ 15mir.09eviu6.js     8.9 KB
+ 59 KB raw (≈16 KB br) of inline RSC payload in `<script>self.__next_f.push(...)</script>`
+ Pyodide preloader (in `requestIdleCallback`) → /pyodide-worker.js → 2.7 MB wasm + 2.4 MB stdlib
```
Render-blocking offenders:
- 70.8 KB `0v3lyuj75aq50.js` — framework + lucide-react. **Lucide is 0 hits in this chunk** (verified) — the 70 KB is React+next runtime; that's normal.
- 40.5 KB `03~yq9q893hmn.js` — homepage client component tree (StreakWidget, HomeClient, PhaseBandedRail, HeroBugSnippet).
- The HTML is 95 KB raw / 16.5 KB br. 62% of the raw HTML is inline RSC. RSC inline payload is unavoidable for streaming RSC, but the homepage doesn't need streaming — it's static-exported. There may be a static-export RSC inline-payload setting worth re-checking.

### `/about/`
Cleanest route. 7.9 KB br HTML, ~95 KB JS br, no markdown chunks. The chunk count is 9, mostly shared with `/`.

### `/learn/v2/variables/naming-things/0/` (heaviest)
```
HTML (23.8 KB br)                              0–155 ms
├─ preload font Fraunces                       parallel
├─ preload font JetBrains                      parallel
├─ preload script 0gf4i~5yhco0v.js (9 KB br)
├─ stylesheet 0p2rz01pihh4z.css (10.7 KB br)
└─ 12× <script> tags: 520 KB br total
   ├─ 0g0.1b61rrwu0.js   245.6 KB ★  (highlight.js + react-markdown + remark/rehype)
   ├─ 0rtztn7-rykwi.js    71.9 KB ★  (codemirror — @uiw/react-codemirror + @codemirror/* + lang-python)
   ├─ 0v3lyuj75aq50.js    70.8 KB    (framework)
   ├─ 03~yq9q893hmn.js    40.6 KB    (page client)
   ├─ 0v9epyrf_9ezc.js    38.6 KB    (shared)
   ├─ 11jr6e17p80zn.js     5.1 KB
   ├─ 08nhfc_ilgu.a.js     2.5 KB
   ├─ 145vedg.q5p3y.js     9.4 KB
   ├─ 028khgf4uqx0..js     9.4 KB
   ├─ 01as9r5n5k.xo.js    13.2 KB
   ├─ 15mir.09eviu6.js     8.9 KB
   └─ turbopack-runtime    4.2 KB
+ 66 KB raw (~22 KB br) inline RSC payload in HTML
+ Pyodide loaded via worker (parallel, non-blocking lesson chrome)
```
**The 246 KB chunk is the killer.** It contains highlight.js (77 string matches for `highlight|hljs`) plus react-markdown + remark-gfm + rehype-raw + rehype-highlight. Every `*StepView.tsx` (7 files) imports `rehype-highlight` directly, which transitively pulls in `highlight.js` with its `common` language set (35+ languages). For a Python-only course this is several hundred KB raw of waste.

### Twin chunks (`*.js` and `0xvistpbjmxoz.js`)
There are two 782 KB raw twin chunks (`0g0.1b61rrwu0.js` is the active one; `0xvistpbjmxoz.js` is a noModule-style fallback). Both contain highlight.js. Confirm they're not both shipped to the same client.

---

## Pyodide UX

**Current cold-start flow**:
1. Landing (`/`) mounts `<PyodidePreloader />` which spawns `new Worker("/pyodide-worker.js")` inside `requestIdleCallback` (200 ms `setTimeout` fallback on Safari).
2. Worker loads `/pyodide/pyodide.js` (7 KB br) → `loadPyodide({ indexURL: "/pyodide/" })`.
3. That instantiates `pyodide.asm.wasm` (2.7 MB br / 8.6 MB raw) and downloads `python_stdlib.zip` (2.4 MB br) + `pyodide-lock.json` (24 KB br).
4. Total compressed wire: **~5.2 MB**. Broadband desktop: ~3–6 s. Slow-3G: 50+ s (measured 52.6 s for wasm alone).
5. Worker posts `{type: "status", payload: "ready"}`. `usePyodide()` flips state on lesson page mount.

**Status: this is well-architected.**
- Worker-isolated, never blocks main thread.
- Preloader uses idle-callback so it doesn't compete with FCP/LCP.
- Singleton pattern in `lib/use-pyodide.ts` reuses the warmed worker across soft navigations.
- `/pyodide/*` and `/pyodide-worker.js` get `Cache-Control: public, max-age=31536000` — verified live. Repeat visits hit browser cache.

**Gaps:**
- The "loading" UX inside the IDE is not assessed here (UX team), but the *mechanic* is sound — lesson chrome renders independently of Pyodide ready state.
- **`pyodide-lock.json` and `python_stdlib.zip` ship with NO `immutable` keyword.** They're versioned by Pyodide release. Adding `immutable` to the `_headers` rule prevents revalidation roundtrips on every reload.
- **No subresource hint for `/pyodide-worker.js` in the homepage HTML.** Browser doesn't learn about it until React hydrates and `<PyodidePreloader />` runs (~200 ms after FCP). A `<link rel="modulepreload">` or a one-line `<script>` snippet that posts `{type:"init"}` to a worker spawned from the static HTML would shave ~200 ms off worker boot.
- **Failure mode: offline mid-load.** If the wasm fetch is interrupted, `loadPyodide` rejects but the worker has no retry. The user sees "Run" disabled forever. There's no surfaced error message to the IDE chrome.
- **CDN miss latency on first visit ever**: Cloudflare strips `cf-cache-status` on free tier so we can't see hit/miss directly, but TTFB on the wasm is consistent ~150 ms on repeat ≠ a cold S3-style miss. Edge cache is working.

---

## Bundle bloat

### Top chunks by raw size (active, non-twin)
| Chunk | Raw | Br | Contents |
| --- | --- | --- | --- |
| `0g0.1b61rrwu0.js` | 783 KB | 246 KB | highlight.js + react-markdown + remark-gfm + rehype-raw + rehype-highlight |
| `0xvistpbjmxoz.js` | 783 KB | (twin) | duplicate of above (legacy fallback) |
| `0rtztn7-rykwi.js` | 313 KB | 72 KB | @codemirror/* + @uiw/react-codemirror + lang-python |
| `0v3lyuj75aq50.js` | 228 KB | 71 KB | React 19 + Next.js runtime + lucide-react icons |
| `0v9epyrf_9ezc.js` | 140 KB | 39 KB | shared client utils |
| `03~yq9q893hmn.js` | 113 KB | 41 KB | homepage client tree |
| `01as9r5n5k.xo.js` | 55 KB | 13 KB | HomeClient + StreakWidget |
| `0p2rz01pihh4z.css` | 54 KB | 11 KB | Tailwind 4 + tokens |
| `145vedg.q5p3y.js` | 44 KB | 9 KB | Next shell |
| `0gf4i~5yhco0v.js` | 33 KB | 10 KB | preloaded prefetch chunk |

### Top tree-shaking opportunities

1. **`highlight.js` import surface.** `rehypeHighlight()` defaults to `common` languages (~35 langs). Promptdojo only highlights Python (and maybe shell/diff). Use `import lowlight` directly with `createLowlight({ python })` and pass `{ languages: { python } }` to `rehype-highlight`. Expected delta: **~150–200 KB raw / ~50–70 KB br off lesson critical path.**
2. **`lucide-react` icons.** Lucide v1.12.0 is the legacy build and tree-shakes poorly with some bundlers. Verify each `import { X } from "lucide-react"` resolves to a per-icon file. Audit by greping for `lucide` in chunks: present in `0ytnnwb_x1o.e.js` only (3 hits) — looks already tree-shaken. Skip.
3. **Twin 783 KB chunk** (`0xvistpbjmxoz.js`). If this is a noModule legacy bundle and the project targets `ES2020+`, deleting it from output saves nothing on modern browsers (already not loaded) — but confirm Next isn't accidentally injecting it via `<script noModule>`. None of the HTML I inspected references it as a script src, so probably fine. Worth a verify.
4. **`react-markdown` on every step.** It's currently in the lesson critical chunk. Since markdown only renders inside step views (mounted on hydration, not on first paint), wrap each `*StepView.tsx` in `next/dynamic(() => import('react-markdown'), { ssr: false })`. Better: render markdown server-side at build time (it's all static MDX-style content) and ship rendered HTML, dropping react-markdown entirely from the client. Expected delta: **~90–110 KB br off lesson initial.**
5. **CodeMirror full bundle.** 313 KB raw / 72 KB br. The IDE renders below the lesson narrative — load it lazily with `dynamic(() => import('@uiw/react-codemirror'), { ssr: false, loading: () => <textarea /> })`. Expected delta: **~70 KB br moved off critical path** (still shipped, just deferred until interactive).
6. **`zod` v4** — present in deps but not verified in any chunk by name. Likely tree-shaken. Skip.
7. **Inline RSC payload size**: 16 KB br on homepage, 22 KB br on lesson. RSC is what makes RSC stream, so this is structural. Only optimization is reducing the *number* of distinct client components on the page (each emits a tree node).

---

## Font loading

Currently fine. Specifically:
- Fraunces + JetBrains Mono via `next/font/google` — self-hosted at build time (no Google Fonts roundtrip).
- 11 `@font-face` declarations: 3 Fraunces subsets + 1 fallback, 6 JetBrains subsets + 1 fallback.
- `font-display: swap` on every weighted face. Fallbacks have `ascent-override` / `size-adjust` (`Times New Roman` for Fraunces, `Arial` for JetBrains) — minimizes CLS.
- Two preloaded fonts in HTML head (the latin / "primary subset" `s.p.*.woff2` files). 40 KB + 62 KB br.

**One real concern:** `Fraunces({ axes: ["SOFT", "WONK"] })` in `app/layout.tsx`. Each axis bloats the variable-font woff2. The 62 KB JetBrains preloaded font is normal for a monospace variable font, but the 40 KB Fraunces is heavy because of those two axes. If `SOFT` and `WONK` aren't actually used in CSS (e.g., `font-variation-settings: 'SOFT' 50, 'WONK' 1`), drop them.

**Subset opportunity:** all subsets ship the latin-ext + Vietnamese + cyrillic ranges. For an English-only course, restricting to `subsets: ["latin"]` (already done) is correct, but next/font still emits the latin-ext face. Confirm only `s.p.*` (primary) is loaded on first paint — yes, that's what's preloaded.

---

## Cache strategy

### `_headers` file (`public/_headers`)
```
/pyodide/*           Cache-Control: public, max-age=31536000
/pyodide-worker.js   Cache-Control: public, max-age=31536000
```
Live and verified — Pyodide assets get a 1-year cache.

### Everything else: `Cache-Control: public, max-age=0, must-revalidate`
**This is the biggest win available.** Every `_next/static/chunks/*.js`, every preloaded font, every CSS file, the OG image — all set to `max-age=0`. These are content-hashed (filename includes a hash), so they're safe to cache forever. Forcing revalidation means each return visit re-hits the CDN with `If-None-Match` and waits for the 304.

Add to `public/_headers`:
```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/chunks/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/media/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=86400
  Content-Type: image/png
```
Also bump Pyodide rules to add `immutable` (versioned URLs):
```
/pyodide/*
  Cache-Control: public, max-age=31536000, immutable

/pyodide-worker.js
  Cache-Control: public, max-age=31536000, immutable
```

### Cloudflare cache hits
Cloudflare Pages free tier strips `cf-cache-status` and `age` from responses — invisible to client measurement. Edge cache *is* working (TTFB consistently ~150 ms ORD). Per-asset CDN miss patterns can't be inspected without a paid plan or `vercel logs`-equivalent. Recommend adding the Cloudflare Web Analytics beacon for RUM data (free, no cookies).

### OG images bug
`https://promptdojo.pages.dev/og/launch/wedge` returns `Content-Type: application/octet-stream`. Files in `out/og/launch/` lack extensions. Twitter/Facebook crawlers will fail to render the image card. **Fix**: rename the static files to `.png` *or* add a `_headers` rule:
```
/og/*
  Content-Type: image/png
```

---

## Mobile perf

Slow-3G simulated with `--limit-rate 50K --user-agent "<Android UA>"`:
- Homepage HTML: 0.22 s (`limit-rate` doesn't kick in for < 50 KB transfers — 16 KB compressed HTML downloads in one TCP window).
- Lesson HTML: 0.13 s (same — small).
- Pyodide wasm: **52.6 s** at 50 KB/s. Real slow-3G (~400 Kbps with packet loss) is more like 60–90 s.
- Lesson critical JS (520 KB br): at 50 KB/s, ~10.4 s additional after HTML.

**Real-world mobile estimate**: on a typical mid-tier Android over 4G LTE (~3 Mbps effective with handshake overhead), the lesson page reaches interactive in ~3–4 s. On a tier-2 country 3G (~700 Kbps), it's 8–12 s, dominated by the 246 KB highlight.js chunk.

**Mobile fixes (priority order):**
1. Fix `highlight.js` over-fetch (saves ~50–70 KB br on every lesson — the single biggest mobile win).
2. Lazy-load CodeMirror (saves ~72 KB br from initial wave).
3. Add `immutable` cache headers (zero impact on first visit, dominant impact on repeat visits).
4. The Pyodide cold-load is brutal on mobile but architecturally hidden — user sees lesson chrome and the IDE button shows "loading…" while 5 MB streams in. Acceptable. Don't block on it.

---

## Top 12 performance moves ranked by user-felt-speed lift

| # | Change | Files | Expected delta |
| --- | --- | --- | --- |
| 1 | Replace default `rehype-highlight` (auto-loads `common` languages) with `lowlight` configured for `python` only (and `bash` if used). Apply in all 7 `*StepView.tsx` files via a shared `lib/markdown-renderer.ts`. | `components/v2/steps/*.tsx`, new `lib/markdown.ts` | **−50 to −70 KB br** off lesson critical path. Cuts 246 KB chunk to ~175 KB raw / ~75 KB br. |
| 2 | Add `Cache-Control: public, max-age=31536000, immutable` for `/_next/static/*` and `/og/*` in `public/_headers`. | `public/_headers` | Repeat-visit LCP drops from ~0.65 s to ~0.15 s (cached HTML still revalidates, all subresources hit memory cache). Saves ~331 KB / page on repeat. |
| 3 | Lazy-load CodeMirror (`@uiw/react-codemirror`) with `next/dynamic({ ssr: false })`. Render a styled `<textarea>` placeholder until interactive. | `components/CodeEditor.tsx` and the lesson page wrapper | **−72 KB br** off lesson initial wave. TTI drops ~200–400 ms on mid-tier devices. |
| 4 | Pre-render markdown content at build time. The course content is static MDX; render via `unified` in `scripts/build-content-v2.mjs` and ship rendered HTML in JSON. Drop `react-markdown` + `remark-gfm` + `rehype-raw` from the client. | `scripts/build-content-v2.mjs`, `lib/content-v2.ts`, all `*StepView.tsx` | **−90 to −110 KB br** off lesson initial. The 246 KB chunk drops to ~50 KB raw. |
| 5 | Fix OG image content-type (currently `application/octet-stream`). Rename `out/og/launch/{wedge,hook,ide,price,capstone}` to `.png` extensions, or add a `_headers` rule. Twitter/X cards currently fail silently. | `public/og/*` (rename) or `public/_headers` | **0 ms perf, but unblocks social sharing** — cards render → CTR on launches. |
| 6 | Drop `axes: ["SOFT", "WONK"]` from `Fraunces({...})` unless those axes are actively used in CSS. Variable-font axis count multiplies woff2 size. | `app/layout.tsx` | **−10 to −15 KB** off the preloaded Fraunces woff2. Faster first paint of headlines on mobile. |
| 7 | Add `<link rel="preload" as="worker" href="/pyodide-worker.js">` to root layout. Browsers don't preload Workers by default; this lets discovery start with the HTML parse rather than after React hydrates. | `app/layout.tsx` | **−150 to −250 ms** off Pyodide ready time on first lesson navigation. |
| 8 | Add `Cache-Control: public, max-age=31536000, immutable` to `/pyodide/*` (current is `max-age=31536000` without `immutable`). | `public/_headers` | Saves a 304-revalidation per Pyodide asset on hard reload. ~50–100 ms on slow connections. |
| 9 | Verify the duplicate 783 KB chunk (`0xvistpbjmxoz.js`) is a legacy noModule fallback and not actually shipped to modern clients. If it *is* shipped, kill it via `next.config.ts` browser target settings. | `next.config.ts` | Up to **−246 KB br** if it's being double-loaded; 0 if it's already ignored. Verify first. |
| 10 | Move highlight.js theme CSS out of the global stylesheet (currently bundled inside `0p2rz01pihh4z.css`). Inline only the styles for python tokens and ship the rest behind a content-only stylesheet that loads with the lesson. | `app/globals.css` (or wherever hljs theme lives) | **−2 to −5 KB br** off CSS critical path. Minor. |
| 11 | Add a built-in retry-with-backoff inside `pyodide-worker.js` for the wasm fetch, plus surface a "Reload Python runtime" button if it fails. | `public/pyodide-worker.js`, `lib/use-pyodide.ts` | 0 ms on happy path; recovers the **~5%** of users who hit network drops mid-wasm-load. |
| 12 | Inline the homepage hero CSS (the rules used by `<h1>` + hero copy) into `<style>` in the HTML head and defer the rest of the CSS chunk. With static export this is a one-time build step. | Build script + `app/page.tsx` | **−50 to −150 ms** off FCP on first visit (eliminates the CSS roundtrip from critical path). Diminishing returns on repeat visits. |

**Gross expected impact stacking #1–#4:** lesson initial JS drops from 520 KB br → ~290 KB br. Lesson TTI improves ~600–900 ms on broadband, ~3–5 s on mobile 4G. Repeat-visit LCP drops below 200 ms.

---

## Status

Performance is **good for a static blog, not yet at a Linear/Vercel/Stripe IDE bar.** The architecture is right (static export, edge-served HTML, worker-isolated Pyodide, font subsetting, brotli on). The remaining gap is bundle bloat on the lesson route (highlight.js + react-markdown + codemirror all on critical path) and `max-age=0` on content-hashed assets that should be `immutable`. Both are low-risk, low-LOC fixes.

The IDE *will* feel native after #1–#4 + #7 land. Pyodide cold-load is the irreducible part — it's 5.2 MB no matter what — but the lesson chrome already renders independently, so users won't feel it as "loading."
