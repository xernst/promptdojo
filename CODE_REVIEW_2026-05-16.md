# Code Review — promptdojo (2026-05-16)

Full-codebase review on the `worktree-code-review-fixes` branch. Quality bar:
findings at **≥75 confidence are ship-blockers** (per the project quality goal
set 2026-05-12). Below-threshold findings are listed but not fixed.

## Coverage

Every code surface was reviewed across three waves:

| Surface | Status |
|---|---|
| `functions/api/**` — Cloudflare Pages Functions (auth, tutor, entitlement, persistence) | ✅ reviewed |
| `components/**` + `components/v2/**` — React UI + lesson runtime | ✅ reviewed |
| `lib/**` — storage, streaks, content loaders, pyodide hook, schema | ✅ reviewed |
| `app/**` — App Router pages, layout, metadata | ✅ reviewed |
| `public/pyodide-worker.js` — Python-in-WASM execution worker | ✅ reviewed |
| `scripts/**` — build, validation, smoke, lint | ✅ reviewed |
| `next.config.ts`, `public/_headers`, `public/_redirects` — config | ✅ reviewed |

## Fixed (≥75 confidence — see commit history)

15 bugs fixed this session, on top of the earlier audit closeout:

- **Lesson runtime** — `latestAttempt` not re-seeded across step navigation
  (Continue gate opened early); reorder grader unwinnable with distractors;
  pyodide timer leak on unmount; BrainDump index key.
- **404 / roast** — `DidYouMean` hydration mismatch on the static 404 page;
  roast `no-examples` rule didn't recognize `Input:`/`Output:` markers.
- **Content pipeline** — unvalidated chapter JSON cast; mutable phase
  assignment in the build script; UTC vs local-time streak day boundary.
- **Pyodide worker** — load-failure permanently bricked the worker;
  `grade-ast` errors replied with the wrong message type and hung; PyProxy
  leak on the error path; infinite loop wedged the worker with no recovery.
- **Security** — `/api/auth/logout` GET alias was a CSRF forced-logout
  vector; tutor endpoint hardened against prompt injection.
- **Scripts** — `fetch-github-stats` cwd-dependent path; `smoke` double-slash
  URLs; `curriculum-lint` crash masked by exit 0.

## Deferred / accepted (documented, not fixed)

1. **Magic-link single-use is not atomic** (`functions/api/auth/verify.ts`).
   CF KV has no compare-and-swap; the `get → delete` pattern leaves a narrow
   window where two concurrent requests could both validate one token. A
   correct fix needs a Durable Object — an architectural change weighed
   against the $0-budget / keep-it-simple constraint. Exposure is bounded by
   the 15-minute token TTL. **Accept; revisit if abuse is observed.**

2. **`validate-solutions.py` runs solution code unsandboxed** at build time.
   This is build-time execution of repo-controlled content — the content
   authors and the engineers are the same person, so content is trusted
   (the same trust model `build-content.mjs` already relies on). **Accepted
   trust boundary.**

3. **`public/_redirects` self-referential rule** —
   `/learn/v2/* /learn/v2/:splat 200` is a working no-op (first-match-wins
   already shields v2 routes from the catch-all below). It functions today;
   rewriting it risks breaking v2 lesson routing for no proven gain. **Left
   as-is — noted for awareness.**

4. **No automated test suite.** There are zero unit/integration/E2E tests.
   Build-time gates (`validate-solutions` 184/184, `typecheck`, `lint`,
   `curriculum-lint`, `smoke`) provide a partial safety net. Adding tests is
   a process recommendation, not a code defect.

Sub-threshold items (KV rate-limit drift under concurrency — an
acknowledged in-code tradeoff; `SAFE_STEP_ID` permitting double-slashes but
not exploitable; session-layer email-format defense-in-depth) were judged
not worth changes and are left as noted.

## Verification

`typecheck` clean · `eslint` clean · `curriculum-lint` 0 errors · content
build 31 chapters · `validate-solutions` 184/184 · full `next build` exits 0
(829 step routes statically generated, chapter-schema validation passes on
every chapter — no drift).
