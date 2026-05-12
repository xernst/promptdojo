# Week 1 Execution Pack

**Date**: 2026-05-11
**Owner**: Josh
**Status**: staged, conditional on audience-auditor's Task #1 verdict
**Source plan**: `docs/plan/LAUNCH-V2.md` §19.5 (Week 1 capped at 5 deliverables)
**Premortem**: `~/Obsidian/v01/20-Projects/promptdojo/premortem-report-20260511-1709.html` (F1 sprint slips, F2 capstone gate ships incomplete)

This is the runbook Josh follows during Week 1 (2026-05-13 through 2026-05-17). Each section is copy-paste-able. Do them in order. Don't skip the verification step at the end of each one.

## How to read this doc

- Every command runs from the repo root: `cd ~/Developer/promptdojo` first.
- "Verify" means run the command and visually check the output before moving on.
- Time estimates assume zero XWELL or CrowdTest interruptions. Pad 50% if either is hot this week.
- If the audience-auditor's verdict on Task #1 is <15% wedge match, this Week 1 pack still runs. Plumbing is launch-blocking either way. Only the Day 0 thread timing changes (slides 30 days while the pivot runbook executes).

---

## Pre-flight: confirm the static-export constraint

Before any work, confirm `next.config.ts` still has `output: "export"`. The /caught/[slug] architecture and Cloudflare Pages free-tier hosting both depend on it.

```bash
grep '"export"' next.config.ts
# expected: output: "export",
```

If this line is gone, STOP. The viral surface architecture is invalid and so is the deploy target. Re-read AGENTS.md and check what changed.

---

## Deliverable 1 of 5: Paste 3 Cloudflare secrets + verify /api/health (~20 min)

The Beehiiv subscribe path returns 503 today and Resend welcome emails fall back to function logs. Both are silent failure surfaces. Pasting the secrets closes them.

### 1a. Get RESEND_API_KEY

1. Open https://resend.com → log in → **Settings** → **API Keys**.
2. Click **Create API Key**. Name it `promptdojo-prod`. Permission: **Sending access**, domain: `promptdojo.dev`.
3. Copy the `re_...` value. You'll only see it once.

### 1b. Get BEEHIIV_API_KEY

1. Open https://beehiiv.com → log in → workspace switcher (top-left) → **Settings**.
2. **Workspace** tab → **API** subsection → **Create API Key**.
3. Name it `promptdojo-prod`. Copy the key.

### 1c. Generate SESSION_SECRET

```bash
openssl rand -hex 32
```

Copy the 64-char hex string. This is the new SESSION_SECRET. Rotating it invalidates every existing session, which is expected and fine (the audience is small enough this week).

### 1d. Paste all three into Cloudflare

1. Open https://dash.cloudflare.com → **Workers & Pages** → **promptdojo** project.
2. **Settings** → **Variables and Secrets** (NOT plain environment variables — `Secret` is encrypted at rest).
3. For each of the three:
   - Click **Add variable**.
   - Type: **Secret** (not Plaintext).
   - Environment: **Production**.
   - Name: `RESEND_API_KEY` (or `BEEHIIV_API_KEY`, or `SESSION_SECRET`).
   - Value: paste the value.
   - Save.
4. After all three are pasted, click **Deployments** → kick a new deploy (or push any commit). Secrets only attach to new deployments.

### 1e. Verify

Wait for the deploy to go green, then:

```bash
curl -s https://promptdojo.dev/api/health | jq
```

Expected output shape:
```json
{
  "ok": true,
  "services": {
    "auth": { "state": "ok", "sessionSecret": true, "authKv": "ok" },
    "progress": { "state": "ok", "progressKv": "ok" },
    "email": { "state": "ok", "resend": true },
    "newsletter": { "state": "ok", "beehiivPublication": true, "beehiivApi": true }
  },
  "notes": []
}
```

All four `state: "ok"`. The `notes` array empty. If anything is `missing` or `degraded`, re-check the variable name (case-sensitive) and that you picked **Production** environment, not Preview.

### 1f. Smoke test the actual subscribe flow

```bash
curl -X POST https://promptdojo.dev/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"plumbing-test+1@joshernst.com"}' | jq
```

Expected: `{"ok": true, "message": "you're in. check your inbox for the welcome."}` and a real email landing within 60 seconds. If you get `ok: false`, check the Cloudflare Pages function logs for the `[subscribe] beehiiv non-2xx` line — that tells you whether it's an auth failure (rotate key) or a Beehiiv 5xx (their problem, retry later).

---

## Deliverable 2 of 5: Em-dash sweep (~3 hours)

Fix the root cause first, then sweep. Doing it the other way reintroduces violations on every future drafted line.

### 2a. Strike the permission line in VOICE.md (root cause)

`design-kit/VOICE.md:48` currently reads:

```
- **Em dashes** (`—`) for asides. Hard breaks, not soft.
```

Replace with:

```
- **No em dashes.** Use commas, periods, parentheses, or hard line breaks. Em dashes read consultant-y and inflate sentences that should be cut.
```

Why this matters: Brand Guardian audit traced ~20 downstream violations to this one permitting line. Future AI-drafted copy will keep regenerating em dashes as long as this line stays. Fix it first.

### 2b. Homepage metadata sweep (HIGHEST blast radius — every link unfurl)

These are the four lines that ship a fresh em dash on every X/LinkedIn/Slack repost of `promptdojo.dev`. They get more impressions in one launch than every other em dash combined.

| File | Line | Current | Recommended replacement |
|---|---|---|---|
| `app/page.tsx` | 27 | `title: "promptdojo — free runnable python school for ai builders"` | `title: "promptdojo. free runnable python school for ai builders"` |
| `app/page.tsx` | 32 | `title: "promptdojo — free runnable python school for ai builders"` (OG) | `title: "promptdojo. free runnable python school for ai builders"` |
| `app/page.tsx` | 40 | `title: "promptdojo — ai writes this. it's wrong."` (Twitter) | `title: "promptdojo. ai writes this. it's wrong."` |
| `app/page.tsx` | 120 | (per /autoplan §18 D1) | Read in context, em dash → comma OR period |
| `app/page.tsx` | 223 | (per /autoplan §18 D1) | Read in context, em dash → comma OR period |

Verification:
```bash
grep -n "—" app/page.tsx
# expected: zero matches
```

### 2c. About page sweep

| File | Line | Recommended fix |
|---|---|---|
| `app/about/page.tsx` | 72 | em dash → period (start new sentence) |
| `app/about/page.tsx` | 88 | em dash → comma |
| `app/about/page.tsx` | 96 | em dash → period |
| `app/about/page.tsx` | 120 | em dash → comma |
| `app/about/page.tsx` | 307 | em dash → parenthetical (use `(` `)`) |
| `app/about/page.tsx` | 315 | em dash → comma |

Read each one in context. If a comma reads stilted, period it. If two periods in a row read choppy, parenthetical it.

### 2d. Pro / founding-members page sweep

| File | Line | Recommended fix |
|---|---|---|
| `app/pro/page.tsx` | 63 | em dash → period |
| `app/pro/page.tsx` | 120-121 | three em dashes in one paragraph. Rewrite the paragraph in 2-3 short sentences instead of a single comma-spliced line. |
| `app/pro/page.tsx` | 142 | em dash → comma |
| `app/pro/page.tsx` | 253 | em dash → period |
| `app/pro/page.tsx` | 257 | em dash → comma |
| `app/pro/page.tsx` | 261 | em dash → period |
| `app/pro/page.tsx` | 282 | em dash → parenthetical |

### 2e. OG card route (rolled-up brand surface)

| File | Line | Recommended fix |
|---|---|---|
| `app/og/launch/[name]/route.tsx` | 193 | em dash → period |

This ships on every shared OG card. Verify by checking the rendered card with:
```bash
curl -s https://promptdojo.dev/og/launch/wedge -o /tmp/og.png && open /tmp/og.png
```

### 2f. Component sweep

| File | Line | Recommended fix |
|---|---|---|
| `components/LoginToSave.tsx` | 380 | em dash → comma |
| `components/LoginToSave.tsx` | 439 | em dash → period |
| `components/StreakWidget.tsx` | 38 | em dash → period |
| `components/StreakWidget.tsx` | 42 | em dash → comma |
| `components/v2/ChapterEndCard.tsx` | 33 | em dash → period |
| `components/v2/LessonStepClient.tsx` | 212 | em dash → comma |
| `components/v2/HomeClient.tsx` | 77 | em dash → comma |
| `components/v2/steps/_grader.ts` | 45 | em dash → comma (this is a grader message; gentler tone) |
| `components/v2/steps/_grader.ts` | 102 | em dash → comma |

### 2g. Final sweep

```bash
grep -rn "—" app/ components/ design-kit/ --include="*.tsx" --include="*.ts" --include="*.md"
```

Should return zero hits. If new ones appear, they leaked from another file you didn't edit — sweep them too. Don't ship Week 1 with any em dashes in the shipped surface.

Then build and visually scan:
```bash
pnpm build
```

---

## Deliverable 3 of 5: Capstone gate Stage 1 (~4 hours)

Per /autoplan §19.6 + §19.7: Stage 1 is schema + vitest test ONLY. Runtime PROGRESS_KV reader and UI gate slide to Weeks 2 and 3. Shipping all three in Week 1 is the F2 failure mode the premortem flagged.

### 3a. Extend the zod schema

File: `lib/content/schema.ts`. The `Lesson` shape already declares `prerequisites: z.array(z.string()).default([])` at line 278. Read that block — the field exists. The problem is upstream: the YAML loader at the lesson level inherits this default but the actual `prerequisites: []` line in the YAML files passes through without ever being populated.

What needs to change: the schema field is fine. Confirm it by reading lines 274-282 of `lib/content/schema.ts`. If the field is already present (it is, per Read on 2026-05-11), no schema edit is needed — Stage 1 is just adding the test that asserts round-tripping, and populating the capstone YAML.

If the field is somehow missing in a future state, add it as:
```typescript
prerequisites: z.array(z.string()).default([]),
```

inside the `Lesson` shape, between `estMinutes` and `steps`.

### 3b. Install vitest

```bash
pnpm add -D vitest @vitest/coverage-v8
```

This is the first test runner in the repo. Verify by:
```bash
ls node_modules/vitest/package.json && cat node_modules/vitest/package.json | jq .version
```

### 3c. Add test script + config

In `package.json`, add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Also add `vitest` to the `check` script chain so CI catches breakage:
```json
"check": "pnpm lint && pnpm typecheck && pnpm check:content:v2 && pnpm validate:solutions && pnpm test && pnpm build"
```

No vitest config file is required for this single test — defaults work. If you want one later, drop a `vitest.config.ts` next to `next.config.ts` with `{ test: { environment: "node" } }`.

### 3d. Write the schema round-trip test

Create `__tests__/schema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { Lesson } from "../lib/content/schema";

describe("Lesson.prerequisites", () => {
  it("round-trips a populated prerequisites list", () => {
    const lesson = {
      slug: "build-a-cli-agent",
      title: "Wire it all together — a CLI agent in 12 steps",
      estMinutes: 14,
      prerequisites: ["13-agent-loops", "14-evals", "15-prompting", "16-mcp"],
      steps: [
        {
          type: "read" as const,
          id: "ch25/l01/s01",
          body: "stub",
          cta: "Got it",
          xp: 2,
          hint: [],
          personalize: false,
          phase: "build" as const,
          estSeconds: 60,
          runnable: true,
        },
      ],
      xpTotal: 2,
    };

    const parsed = Lesson.parse(lesson);
    expect(parsed.prerequisites).toEqual([
      "13-agent-loops",
      "14-evals",
      "15-prompting",
      "16-mcp",
    ]);
  });

  it("defaults prerequisites to [] when omitted", () => {
    const lesson = {
      slug: "stub",
      title: "stub",
      steps: [
        {
          type: "read" as const,
          id: "ch01/l01/s01",
          body: "stub",
          cta: "Got it",
          xp: 2,
          hint: [],
          personalize: false,
          phase: "build" as const,
          estSeconds: 60,
          runnable: true,
        },
      ],
      xpTotal: 2,
    };

    const parsed = Lesson.parse(lesson);
    expect(parsed.prerequisites).toEqual([]);
  });
});
```

Run it:
```bash
pnpm test
```

Expected: 2 tests passing. If failing, the schema shape drifted from the version read on 2026-05-11 — re-read `lib/content/schema.ts` lines 274-282 and update the test field names to match.

### 3e. Populate the capstone YAML prerequisites

File: `content/python/25-capstone/01-build-a-cli-agent/lesson.yaml`. Line 4 currently reads:
```yaml
prerequisites: []
```

Replace with:
```yaml
prerequisites:
  - 13-agent-loops
  - 14-evals
  - 15-prompting
  - 16-mcp
```

The slugs must match the actual lesson slugs in `content/python/13-*`, `14-*`, `15-*`, `16-*`. Verify with:
```bash
ls content/python/ | grep -E "^(13|14|15|16)-"
```

Use whatever the directory names are. The list should be 4 strings, one per phase 4 chapter the capstone narrative says is required.

### 3f. Build + verify

```bash
pnpm check:content:v2
```

The content builder should parse the YAML, run it through `Lesson.parse`, and emit the manifest without errors. If it errors on the prerequisites field, your YAML indentation is off — re-check.

### NOT in Week 1 (slides to Weeks 2 + 3)

- **Stage 2 (Week 2)**: PROGRESS_KV reader at the capstone route. Reads completed steps. Redirects to ch13 if any of the 4 prereqs aren't complete. Vitest mocks PROGRESS_KV and asserts the redirect.
- **Stage 3 (Week 3)**: UI gate as a pre-entry redirect, NOT a post-completion banner. Manual QA must include the sidebar-cold-jump-from-ch3 path.

Both are launch-blocking. Don't merge to main until all three stages are in.

---

## Deliverable 4 of 5: Micropip interstitial at END of ch12 (~2 hours)

Why at the end of ch12 and not inside ch13: the PROGRESS_KV step-index keys are positional. Inserting a step mid-chapter renumbers every downstream step and silently breaks saved progress for returning learners (F6 — premortem's most-missed risk). Appending at the end of ch12 preserves all existing indices.

### 4a. Find ch12's directory

```bash
ls content/python/ | grep -E "^12-"
```

Should return one directory. Call it `12-X` for the rest of these instructions (where X is whatever ch12's actual slug is — probably `12-comprehensions` or similar).

### 4b. Find ch12's last lesson

```bash
ls content/python/12-*/
```

Note the highest-numbered lesson directory (e.g. `04-something`). The new lesson appends after it. If ch12 has 4 lessons, the new one is `05-debugging-micropip-imports`.

### 4c. Create the new lesson directory

```bash
mkdir -p content/python/12-X/05-debugging-micropip-imports
```

### 4d. Write `lesson.yaml`

```yaml
slug: debugging-micropip-imports
title: "When a package isn't there — fixing ModuleNotFoundError in the browser"
estMinutes: 6
prerequisites: []
order:
  - 01-the-problem.read.md
  - 02-install-pydantic.write.yaml
```

### 4e. Write `01-the-problem.read.md`

```markdown
# The error you'll hit in ch13

Starting in chapter 13, you'll import packages like `pydantic`, `anthropic`, and `httpx`. The browser python (pyodide) doesn't have these pre-installed. You'll see this:

```python
import pydantic
# ModuleNotFoundError: No module named 'pydantic'
```

The fix is `micropip`. It downloads pure-python packages from pypi into the in-browser environment. It runs once per package per session.

The pattern you'll use across every LLM chapter:

```python
import micropip
await micropip.install("pydantic")
import pydantic
```

Three rules:

1. `await` matters. micropip.install returns a promise. If you skip `await`, the import on the next line runs before the package is downloaded and you get the same error.
2. Pure-python packages only. If a package needs C extensions (numpy, lxml), micropip can't help. Pyodide ships a curated list of C-built packages separately. We won't need them in this course.
3. Re-run on every cold boot. Refresh the page and the package is gone. The IDE handles this for you in the LLM chapters (the install runs on load), but if you ever copy code out, remember the install step has to run first.
```

### 4f. Write `02-install-pydantic.write.yaml`

```yaml
id: ch12/l05/s02
type: write
xp: 4
phase: build
estSeconds: 120
concept: micropip
prompt: |
  Install pydantic with micropip, then define a BaseModel called `Bug`
  with two fields: `title` (str) and `severity` (int). Create an instance
  with title="off-by-one" and severity=2, then print it.
starter: |
  import micropip
  # write your code here

grader:
  kind: stdout-equality
  expected: |
    title='off-by-one' severity=2
  normalize: collapse-trailing-newline

solution: |
  import micropip
  await micropip.install("pydantic")
  from pydantic import BaseModel

  class Bug(BaseModel):
      title: str
      severity: int

  bug = Bug(title="off-by-one", severity=2)
  print(bug)

hint:
  - level: 1
    body: "remember to `await` the install before the import"
    cost: 0
  - level: 2
    body: "pydantic v2's __repr__ prints `field=value` (no quotes around the field name, single quotes around the string value)"
    cost: 0
```

### 4g. Verify

```bash
pnpm check:content:v2 && pnpm test
```

Both green. Then manually visit the page locally with `pnpm dev` and step through the new lesson at `http://localhost:3000/learn/v2/12-X/debugging-micropip-imports/`.

---

## Deliverable 5 of 5: bun → pnpm sweep + vitest scaffold + subscribe.ts fix (~3 hours)

Three small things bundled. They're related: all three sharpen the contributor experience and close silent-failure surfaces.

### 5a. Audit current bun references

```bash
grep -rn "bun " README.md CONTRIBUTING.md AGENTS.md package.json
grep -rn "bun" scripts/ 2>/dev/null
grep -rn "bun " .github/ 2>/dev/null
```

Note every hit. For each one, the recommended replacement is `pnpm` (one-to-one mapping for install / dev / build / test).

### 5b. Update `package.json`

Add a `packageManager` field. This is the canonical fix — `corepack` reads it and switches the contributor's pnpm version automatically.

```json
{
  "name": "promptdojo",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": { ... }
}
```

Pick the actual pnpm version Josh is using locally:
```bash
pnpm --version
```

Use that exact version in the field.

### 5c. Add `.nvmrc`

```bash
echo "20" > .nvmrc
```

If `.nvmrc` already exists, leave it. The point is just that `nvm use` picks the right Node.

### 5d. Sweep `bun` references in docs

In README.md, CONTRIBUTING.md, AGENTS.md: every `bun install` → `pnpm install`, every `bun run X` → `pnpm X` (no need for `run`), every `bun dev` → `pnpm dev`.

The single trickiest line is in AGENTS.md (5 lines today, will grow in Week 2). If it says anything like "install with bun," kill the verb-and-noun, just say "install with pnpm; lockfile is pnpm-lock.yaml."

### 5e. Add a doctor script (defer the actual `pnpm doctor` to Week 2, but stub it now)

In `package.json` scripts, add:
```json
"doctor": "node -e \"const v=process.version.replace('v','').split('.')[0]; if(+v<20){console.error('node 20+ required, got '+process.version);process.exit(1)} else {console.log('node OK ('+process.version+')')}\""
```

It's a one-liner now. Week 2 expands it.

### 5f. Fix subscribe.ts:121-128 (return 502, not 200, on Beehiiv 5xx)

File: `functions/api/subscribe.ts`. The current `!res.ok` branch returns `json({ ok: false, ... })` with no status code, which defaults to **HTTP 200**. Monitors hitting `/api/subscribe` can't distinguish a successful subscribe from a Beehiiv 5xx outage.

Find lines 121-128:
```typescript
if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error("[subscribe] beehiiv non-2xx", res.status, text.slice(0, 500));
  return json({
    ok: false,
    error: "couldn't subscribe — try again in a moment",
  });
}
```

Replace with:
```typescript
if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error("[subscribe] beehiiv non-2xx", res.status, text.slice(0, 500));
  // 4xx from Beehiiv = user error (bad email, dupe). 5xx = their problem.
  // Return 502 for upstream failures so monitors can alarm; 400 for client errors.
  const status = res.status >= 500 ? 502 : 400;
  return json({
    ok: false,
    error: "couldn't subscribe, try again in a moment",
  }, status);
}
```

Note the em dash was removed from the error message too (was "couldn't subscribe — try again", now uses a comma).

Also note: the catch block at line 137 has the same bug for the timeout path (returns implicit 200). Fix it too:

```typescript
} catch (err) {
  const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
  console.error("[subscribe] fetch error", isTimeout ? "timeout" : String(err));
  return json({
    ok: false,
    error: isTimeout ? "beehiiv timed out, try again" : "network hiccup, try again",
  }, 502);
}
```

### 5g. Write the minimum vitest tests for subscribe

Create `__tests__/subscribe.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestPost } from "../functions/api/subscribe";

type Env = {
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
};

function makeRequest(body: unknown, ip = "1.2.3.4"): Request {
  return new Request("https://promptdojo.dev/api/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

describe("/api/subscribe", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 503 when BEEHIIV_API_KEY is missing", async () => {
    const env: Env = { BEEHIIV_PUBLICATION_ID: "pub_x" };
    const res = await onRequestPost({ request: makeRequest({ email: "a@b.com" }), env });
    expect(res.status).toBe(503);
  });

  it("returns 200 on Beehiiv 2xx happy path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 201 })),
    );
    const env: Env = { BEEHIIV_API_KEY: "k", BEEHIIV_PUBLICATION_ID: "p" };
    const res = await onRequestPost({
      request: makeRequest({ email: "happy@example.com" }, "1.1.1.1"),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 502 on Beehiiv 5xx (the bug we fixed)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("internal", { status: 500 })),
    );
    const env: Env = { BEEHIIV_API_KEY: "k", BEEHIIV_PUBLICATION_ID: "p" };
    const res = await onRequestPost({
      request: makeRequest({ email: "fail@example.com" }, "2.2.2.2"),
      env,
    });
    expect(res.status).toBe(502);
  });

  it("rate-limits after 5 calls from the same IP in 60s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 201 })),
    );
    const env: Env = { BEEHIIV_API_KEY: "k", BEEHIIV_PUBLICATION_ID: "p" };
    const ip = "9.9.9.9";
    for (let i = 0; i < 5; i++) {
      const ok = await onRequestPost({
        request: makeRequest({ email: `t${i}@example.com` }, ip),
        env,
      });
      expect(ok.status).toBe(200);
    }
    const limited = await onRequestPost({
      request: makeRequest({ email: "t6@example.com" }, ip),
      env,
    });
    expect(limited.status).toBe(429);
  });
});
```

Run:
```bash
pnpm test
```

Four tests pass. (Plus the two schema tests from Deliverable 3 = 6 passing.) If the rate-limit test fails because of test ordering, the in-memory map in subscribe.ts persists across tests in the same file — either reset it via an exported helper or restructure the test to run in a fresh process.

### 5h. Verify end-to-end

Fresh clone test (do this in `/tmp` to make sure a contributor wouldn't trip):
```bash
cd /tmp
git clone ~/Developer/promptdojo promptdojo-fresh
cd promptdojo-fresh
pnpm install
pnpm dev
```

Visit http://localhost:3000. If the dev server boots clean and the homepage renders, the bun→pnpm sweep is complete. Close out, remove `/tmp/promptdojo-fresh`.

---

## Week 1 Done. What's green.

- [ ] `/api/health` returns all four services `state: "ok"`
- [ ] `grep -rn "—" app/ components/ design-kit/` returns zero
- [ ] `pnpm test` passes 6 tests (2 schema, 4 subscribe)
- [ ] `pnpm check:content:v2` parses the new ch12 micropip lesson without error
- [ ] `pnpm check:content:v2` parses the populated capstone prerequisites without error
- [ ] Fresh `pnpm install` from a clean clone boots `pnpm dev` without referencing bun
- [ ] subscribe.ts returns 502 on Beehiiv 5xx (verified by test)

If any box is unchecked Friday EOD 2026-05-17, Week 2 starts with a debt. Per /autoplan §19, that's the F1 failure mode (sprint slips). Email team-lead before adding Week 2 work.

## What's deliberately NOT in Week 1

Per /autoplan §19.5 and the premortem F1 finding: Week 1 caps at 5 deliverables. These slide to Weeks 2 and 3.

- Capstone runtime PROGRESS_KV reader (Stage 2, Week 2)
- Capstone UI pre-entry redirect (Stage 3, Week 3)
- /caught/[slug] viral surface (Week 2)
- Pyodide warming indicator (Week 2)
- Grader empathy upgrade (Week 2)
- GitHub Action auto-tweet bot (Week 2 — see `docs/bot-observability-spec.md`)
- AGENTS.md expansion to 40 lines (Week 2)
- DESIGN.md index (Week 2)
- Mobile pass on HeroBugSnippet at 375px (Week 3)
- /pro → /founding-members 301 redirect (Week 3)
- Pre-written Day 0-3 distribution copy (Week 3)

Resist scope creep. Week 1 is plumbing only.
