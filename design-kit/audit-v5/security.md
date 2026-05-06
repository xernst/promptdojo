# Security Audit
_Date: 2026-05-06_

_Scope: `promptdojo` static-export Next.js 16 app on Cloudflare Pages, including `functions/api/*` Pages Functions, the localStorage progress layer, the Pyodide IDE worker, the OG image route, and repo hygiene. Read-only review against the source tree at `/Users/joshernst/Developer/code-killa`. No live exploitation._

## Threat model summary

promptdojo is a public, read-only learning app with one durable trust boundary: the two Cloudflare Pages Functions (`/api/save`, `/api/load`) that read and write a per-email key in the `PROGRESS_KV` namespace. The "auth" model is intentionally trustless — typing an email key reads or overwrites that email's progress blob; this is documented in `LOGIN-SETUP.md` as a feature for shared learning, not a bug. The interesting attack surface is therefore (a) abusing the unauthenticated KV write path to exhaust the free tier or stuff the namespace with arbitrary blobs, (b) injecting content into any rendered surface that's not the markdown lessons (which are bundled, not user-supplied), and (c) the Pyodide sandbox, which by virtue of running in a Web Worker on the same origin can read localStorage if user code manages to hop the worker boundary. Server-side code is small (~80 LOC across the two Functions and the Beehiiv server action). Client surface is the dominant LOC but nearly all input comes from bundled JSON content, not user input. There is no use of React's raw-HTML injection prop and no `rehype-raw` in any markdown renderer — react-markdown's default escaping holds.

## Critical (exploitable now)

**None.** No findings rise to "data loss / credential exposure / RCE on production." The closest are Highs below, all denial-of-wallet / data-integrity classes that align with the documented "trustless by design" model.

## High (likely to bite under load or hostile use)

- **`functions/api/save.ts:20-46` — No rate limiting on `/api/save`. Any unauthenticated client can POST up to ~200 KB per request to arbitrary email keys.** A trivial loop can burn through the Cloudflare KV free tier (1,000 writes/day) in seconds, and a slightly less trivial loop can stuff the namespace with junk keys. Exploit: `for i in $(seq 1 1000); do curl -X POST .../api/save -H 'content-type: application/json' -d "{\"email\":\"a$i@x.x\",\"payload\":{\"junk\":\"$(printf 'x%.0s' {1..150000})\"}}" & done`. Fix: add a Cloudflare WAF rate-limiting rule on `POST /api/save` (e.g. 10 requests/min per IP) and/or enforce a Turnstile token on first save in the client. WAF rule is the cheaper, faster fix.

- **`functions/api/save.ts:28-31` and `functions/api/load.ts:21-25` — Email validation only checks `includes("@") && length <= 200`.** That accepts garbage like `@`, `.@.`, `<script>@x`, control chars, NULs, and very long unicode. Because the email is the **KV key**, attackers can plant keys with weird characters or even unicode that visually impersonates other users (`a@b.cоm` with a Cyrillic `о`). Combined with the no-auth model this is mostly a junk-data problem, but it also makes targeted account squatting trivial: register `josh@xwell.com` as soon as that email is mentioned anywhere public. Fix: tighten to a real RFC-ish regex (use the same `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` the Beehiiv action and `LoginToSave.tsx` already use locally — odd that the server is looser than the client) and reject anything containing control characters or non-ASCII outside the local part.

- **`functions/api/load.ts:34-40` — Trustless read returns the raw stored value verbatim, including its `payload` blob.** Because anyone can write any payload to any key (no auth), an attacker can poison `josh@example.com`'s entry with a payload designed to break or mislead the app on next load. The client already does `JSON.parse` defensively (`lib/storage.ts:193-211` falls back to `freshV2()` on throw, and spreads with safe defaults), so a malformed payload won't trigger script injection — but a *well-formed* `ProgressV2`-shaped payload with hostile draft strings or `userId` could be quietly accepted and synced back up. Worst-case is reputational ("someone wiped my progress") rather than account takeover. Fix: validate the payload server-side against a Zod schema before `KV.put`, or sign payloads from the client with a per-session HMAC. The cheap fix is server-side schema validation; you already have Zod.

## Medium / hygiene

- **`functions/api/save.ts:11` — `MAX_BYTES = 200_000` is per-request but the per-key KV value limit is 25 MiB. With 1k writes/day on the free tier and 200 KB/write, a single attacker can put ~200 MB/day into the namespace pre-overwrite.** That's well under the 1 GB storage cap, but worth tightening: the actual progress blob is <10 KB even after the full course (per `LOGIN-SETUP.md`), so cap `MAX_BYTES` at 32 KB. Also enforce a maximum number of unique keys the function will accept per IP per day if you can wire it up via Durable Objects later — out of scope for v5.

- **No CORS configuration.** Pages Functions default to same-origin only for browser fetches, but the endpoints accept any `Origin` header server-side. If a future feature adds an `Access-Control-Allow-Origin: *` you've widened the abuse surface. Add an explicit `Access-Control-Allow-Origin: https://promptdojo.dev` (or `pages.dev`) on the response and reject other origins with 403. Defensive, not currently exploitable.

- **`functions/api/save.ts:33-37` and `load.ts:27-31` — Error message `"kv binding missing — configure PROGRESS_KV in Pages settings"` discloses internal binding name and config posture.** Low impact (binding name is in the public repo anyway), but in general 503s should be opaque externally and verbose only in logs. Replace with `{"error": "service unavailable"}` and log the detail.

- **`app/actions/subscribe.ts:61-67` — `console.error` logs `res.status` and the response body text from Beehiiv.** If Beehiiv ever returns the submitted email or hashed key in an error body, that lands in Cloudflare logs. Low risk but: log only `res.status`, drop the body.

- **`components/LoginToSave.tsx:32-40` and `lib/storage.ts:32-42, 183-212` — `JSON.parse` of localStorage with no schema check.** No script-injection path because the parsed value is only spread into typed reducers and never rendered as HTML, and the markdown renderer escapes by default. But a future feature that *does* render `profile.name` as raw HTML (or interpolates it into a code-template that gets evaluated) would cross a boundary. The defense-in-depth fix is to run the localStorage payload through `ProgressV2` Zod schema on load. Cheap and matches the codebase convention.

- **`lib/content/schema.ts:369-378` `interpolate()` regex `/\{\{\s*(user\.[a-zA-Z]+)\s*\}\}/g` only allows `[a-zA-Z]+` after `user.`, so `{{user.constructor}}` resolves to `""`.** No prototype-pollution gadget. Keep this regex tight; if it's ever broadened to `[\w.]+` you've opened a hole.

- **`components/v2/PersistentIDE.tsx` + `public/pyodide-worker.js`** — User Python runs in a Web Worker, which gives it a separate global but the worker is *same-origin*. The worker has no DOM access (good) and no access to the main thread's `localStorage` (also good — workers get their own). The worker does have `fetch()` and can hit `/api/save` and `/api/load` via relative URLs, but only with an email it's been told. Since lesson Python is bundled (not user-supplied), and the IDE only runs *user-typed* code, the realistic worry is: a learner pastes hostile Python from the wild, runs it, and it exfiltrates their own localStorage. The mitigation isn't about promptdojo — it's the same warning every browser-IDE has. Worth a one-line note in the lesson copy. No code change.

- **`scripts/build-content.mjs` runs `solutions/exercise_*.py` in a subprocess at build time.** This is a build-time issue not a runtime one, but if `COURSE_PATH` is ever pointed at an untrusted directory (e.g. via PR-provided env), arbitrary Python runs on the build machine. CI builds for forks should not have repo-write secrets. Out of scope for the live app, worth flagging if you ever take community contributions.

## Defense-in-depth nice-to-haves

- **Add `_headers` security headers for all paths.** The current `public/_headers` only sets cache control for `/pyodide/*`. Add at the top of the file:
  ```
  /*
    Strict-Transport-Security: max-age=31536000; includeSubDomains
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    X-Frame-Options: DENY
    Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
  CSP is harder because Pyodide needs `wasm-unsafe-eval` and inline `script-src` for Next.js; defer until you've measured what breaks.
- **Add `crossorigin="anonymous"` and SRI to any third-party scripts.** Currently you self-host Pyodide (`scripts/copy-pyodide.mjs` copies it from `node_modules`), so this is moot — but if you ever load Pyodide from `cdn.jsdelivr.net` for cost, SRI matters.
- **Rotate and scope the Beehiiv API key** to subscribe-only permissions, not full account access.
- **Add a deny-list of obviously-abusive email patterns** server-side (e.g. emails > 254 chars, IDN homoglyph mix, `localhost`, `*.local`).
- **Per-IP throttle on `/api/load`** is also worth doing — currently a scraper can iterate emails to enumerate which ones have saved progress.
- **Set `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` only as platform secrets**, never in any committed file (currently clean — confirmed `.env.example` is empty placeholders).
- **Add a Cloudflare Turnstile challenge** to first save from a given IP. Free, invisible, solves the rate-limit-and-spam problem cleanly.

## What's GOOD (so we don't regress)

- **No use of React's raw-HTML injection prop anywhere in `app/`, `components/`, or `lib/`.** Verified by grep.
- **No `rehype-raw` plugin loaded anywhere.** ReactMarkdown is invoked with only `remarkGfm` and `rehypeHighlight` — both of which escape raw HTML by default. Lesson markdown is a bundled trusted source anyway, but the defense-in-depth holds even if it weren't.
- **No committed secrets.** `.env.example` is empty placeholders; `.gitignore` correctly excludes `.env`, `.env.*`, `.dev.vars`, `*.pem`, `.vercel`. `wrangler.toml` is intentionally absent (Pages dashboard binding is used, per `LOGIN-SETUP.md`).
- **Server-side keeps the Beehiiv key off the wire.** `app/actions/subscribe.ts` is `"use server"` — the key never appears in the client bundle. (Static export caveat: this works only on Vercel/SSR runtimes, not on the Cloudflare Pages static export. Confirm where the form is actually hosted; if it's the same `pages.dev` deploy as `/api/`, the server action won't execute without a Pages Functions wrapper. **This is a behavioral concern, not a security one — flagged for awareness.**)
- **Client-side email regex is correct** in `LoginToSave.tsx:54` and `subscribe.ts:17`: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. The server-side Functions are looser (the High above) — bring them up to parity.
- **Pyodide is self-hosted** (`scripts/copy-pyodide.mjs` copies from `node_modules` to `/public/pyodide`). No third-party CDN dependency, no SRI gap, no jsdelivr supply chain to worry about.
- **`lib/storage.ts` defensively spreads parsed localStorage over a fresh `freshV2()` seed** (lines 193-211) so even a partially-corrupted blob loads cleanly. This is the right pattern.
- **`interpolate()` regex is appropriately tight** (`[a-zA-Z]+` only) — no prototype-pollution gadget reachable through user-profile substitution.
- **`/api/save` enforces a 200 KB request body cap** (line 41) — the cap is too generous given actual progress blobs are <10 KB, but the cap exists, which is the harder thing to remember.
- **Pyodide worker runs with a clean `__ck_run` wrapper** that captures stdout/stderr safely and resets `sys.stdout`/`sys.stderr` in `finally`. Standard pattern, no obvious bypass.
- **No `eval` calls and no Function-constructor invocations** in the application code (Pyodide internally relies on dynamic-code primitives but that's expected for a Python interpreter).
- **OG image route (`app/og/launch/[name]/route.tsx`) uses `force-static` and `generateStaticParams` with a 5-name allowlist + `notFound()` fallback.** No untrusted input reaches `ImageResponse`. Clean.
- **Supply-chain quick-look:** dependency tree is small and current — Next 16.2.4, React 19.2.4, Pyodide 0.28.3, Zod 4.3.6, react-markdown 10.1.0. Nothing obviously abandoned. No `lodash`, no `moment`, no `node-uuid`. lucide-react is on 1.12.0 (the new release line) which is unusual but not a CVE.
