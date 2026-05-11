# Contributing to promptdojo

The curriculum is built from real AI mistakes. **Your bug reports ARE the curriculum's primary input** — that's the whole shape of this project.

There are two surfaces in this repo. Knowing which one you're touching saves you a wasted PR.

| You want to... | Edit this | Ships to |
|---|---|---|
| Fix a typo or improve a lesson on the live web app | `content/python/<chapter>/<lesson>/<step>.{yaml,md}` | promptdojo.dev (renders via Next.js) |
| Improve the long-form chapter notes / book | `01-getting-started/`, `02-variables-and-types/`, ... at the repo root | The book companion (not the live site) |
| Fix a UI / design / build issue | `app/`, `components/`, `lib/`, `public/` | promptdojo.dev |
| Add or improve a Cloudflare Pages Function | `functions/api/` | promptdojo.dev API routes |

**The canonical learner-facing source is `content/python/`.** When in doubt, edit there.

---

## Most-wanted contributions, ranked

### 1. AI-got-this-wrong reports — the highest-leverage thing you can do

Open an issue using the [🐛 AI got this wrong](https://github.com/xernst/promptdojo/issues/new?template=ai-got-this-wrong.yml) template.

The bar is low: a screenshot + one sentence is plenty. We need:
- which AI tool wrote the code (Cursor / Claude Code / ChatGPT / Copilot)
- the prompt
- the buggy output (paste or screenshot)
- what was actually wrong

Every triaged report becomes a candidate lesson. That's how the curriculum grows.

### 2. Typo / broken link / unclear sentence fixes

Use the [✏️ Typo / broken link](https://github.com/xernst/promptdojo/issues/new?template=typo-or-broken-link.yml) template, or open a PR straight against `content/python/<chapter>/<lesson>/`. Self-merging typo PRs is fine if you're confident; flag it as a draft if not.

### 3. New lesson PRs

Run them by an issue first (description + the AI bug it teaches). Lessons follow the 9-step template:

```
01-intro.read.md          # explanatory markdown + a runnable example
02-<concept>.mc.yaml      # multiple choice
03-<concept>.read.md      # deeper read
04-<concept>.predict.yaml # predict the output
05-<concept>.fill.yaml    # fill in a missing line
06-<concept>.fix.yaml     # fix a bug
07-<concept>.fix.yaml     # fix a harder bug
08-<concept>.write.yaml   # write from scratch
09-checkpoint.checkpoint.yaml  # bigger drill, multi-case
```

Look at `content/python/16-agent-loops/04-evaluator-optimizer/` as the reference shape. Every step file is validated by Zod at build time (`pnpm prebuild`); a malformed YAML will fail the build before it ever ships.

`write` and `checkpoint` solutions are also executed through their graders at build time (`pnpm validate:solutions`). If you change a step's expected output or its grader rules, the build will fail until the `solution` matches. Set `SKIP_VALIDATE_SOLUTIONS=1` to bypass in environments without Python 3.10+.

### 4. UI / build / infra PRs

Open an issue first to confirm direction. The site is Next.js 16 static export → Cloudflare Pages; bigger architectural changes need a heads-up. For local setup see `DEPLOY.md`.

---

## Local setup

```bash
git clone https://github.com/xernst/promptdojo.git
cd promptdojo
pnpm install
pnpm dev          # http://localhost:3000
```

You'll need:
- Node 20+
- pnpm (`corepack enable` if you don't have it)
- `python3` on PATH (used by the v1 build script — even if you only touch v2 content)

The first `pnpm dev` will copy Pyodide into `public/pyodide/` (~50MB, takes a moment) and build all chapter manifests. Subsequent boots are fast.

---

## Voice

If you're contributing copy:
- lowercase headlines on the site
- short sentences
- specific bugs, not abstractions ("`sorted()` defaults to ascending" beats "AI gets sort order wrong")
- no "as an AI language model" — name the human stake
- no hedging ("might", "could be", "perhaps") in instructional content
- one ember-italic word per heading (e.g., "ai writes this. _it's wrong._")

The site has a real design system in `app/globals.css`. Use the existing tokens and classes (`t-h2`, `t-eyebrow`, `dojo-btn-primary`, etc.); don't introduce parallel ones.

---

## Code style

- TypeScript strict, prefer `unknown` over `any`
- Functional React (no class components)
- Server components by default; mark client components explicitly with `"use client"`
- Static export friendly: no `headers()`/`redirects()` config — use `public/_headers` and `public/_redirects` instead
- No tests required for typo/copy PRs. UI/infra PRs benefit from at least a manual repro before merge.

---

## Questions?

- Async: open a [GitHub Discussion](https://github.com/xernst/promptdojo/discussions)
- Same-day: dm [@TFisPython](https://x.com/TFisPython) on X

By contributing you agree your work is licensed under the [MIT license](LICENSE).
