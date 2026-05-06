---
xp: 2
estSeconds: 110
concept: claude-md-anatomy
code: |
  # the canonical structure of a good CLAUDE.md, distilled.

  GOOD = """\
  # Project conventions

  ## Stack
  - pnpm (not npm). Lockfile: pnpm-lock.yaml.
  - Next.js 16, React 19, Tailwind v4 (no `tailwind.config.js`).
  - TypeScript strict; no `any`, prefer `unknown` and narrow.

  ## Folder layout
  - app/ — Next.js routes
  - components/ — shared UI
  - lib/ — utilities (no React)

  ## Forbidden
  - Don't modify v1/ — frozen for legacy support.
  - Don't add new global state. Use react-query for server state.

  ## Where to look
  - Build pipeline: scripts/build.mjs (read this before changing builds)
  - Auth flow: docs/auth.md (link, don't duplicate)
  """

  print("rules:", GOOD.count("- "))
  print("links:", GOOD.count("docs/"))
  print("words:", len(GOOD.split()))
---

# What "good" looks like

A good CLAUDE.md / AGENTS.md / `.cursor/rules` file has four
properties. Steps 4–9 will drill each.

## 1. Terse

A good file is **30–80 lines for the global root**, scaling to
~150 if you have a lot of forbidden patterns. Beyond that, the
model starts losing track. Every line earns its slot.

The rule of thumb: **read the file out loud**. If it sounds like a
manifesto, it's too long. If it sounds like a checklist, it's the
right size.

## 2. Actionable

Each rule should be something the model can DO or AVOID:

- ✅ "Use `pnpm`, not `npm`." (model can act)
- ✅ "Don't add new global state." (model can avoid)
- ❌ "Aim for high code quality." (model can't operationalize)

The test: if you pasted the rule into a code review checkbox,
could a reviewer mark it pass/fail? If yes, it's actionable.

## 3. Links instead of duplicating

The file is a system prompt; it's loaded into the model's context
on every session. **Repeating large blocks of documentation
inside the file is a tax on every call**.

Instead, link:

```md
- Auth flow: docs/auth.md
- Database schema: docs/db-schema.md
- API contract: openapi.yaml
```

The model can read these on demand if a task touches them. Most
tasks don't, and you save tokens on every call that doesn't need
the detail.

## 4. No fluff

The model already knows generic best practices:

- Clean code
- Helpful tone
- Accurate answers
- Test your work
- Don't introduce regressions

These don't belong in the file. They're advice the model is
already trained to follow. **Stating them doesn't change behavior;
it just costs tokens.**

The acid test: replace the rule with the words "duh, obviously."
If the rule still makes sense, it's fluff. Cut it.

## What everyone calls these

| File | Convention | Hierarchical? |
|---|---|---|
| `CLAUDE.md` | Anthropic / Claude Code | Yes — root + nested |
| `AGENTS.md` | Open standard (Codex, GitHub coding agents) | Yes — root + nested |
| `.cursor/rules/*.mdc` | Cursor — one rule per file | Yes — globbed by path |
| `.clinerules` | Cline | Per workspace |
| `CONVENTIONS.md` | Aider | Per --read flag |
| `system_prompt` (in agent code) | Custom harnesses | Single file |

When you're picking which to write: if the project has multiple
agents touching it (Claude Code in IDE, Codex in CI, Cursor in
editor), write **AGENTS.md** — it's the open standard and most
agents read it. Use `CLAUDE.md` only when Claude Code is the sole
target, or use both (Claude Code reads CLAUDE.md preferentially;
falls back to AGENTS.md).

## Hierarchy: how nested files combine

In Claude Code, files cascade:

```
~/.claude/CLAUDE.md          ← global, every project
project/CLAUDE.md            ← project, every file in this repo
project/apps/web/CLAUDE.md   ← scoped, only files under apps/web
```

When the agent edits `project/apps/web/components/Button.tsx`,
all three files are merged into the system prompt. Specific
overrides general. This means you can:

- Put general taste rules in `~/.claude/CLAUDE.md` (your global
  preferences).
- Put project-wide rules in `project/CLAUDE.md`.
- Put scope-narrow rules in nested files.

The bug to avoid: the same rule stated three times across the
hierarchy with conflicting wording. The model sees all three and
gets confused. **State each rule once, at the most specific
applicable level.**

## What this lesson is NOT

- Not a tutorial on Cursor's rule glob syntax (varies, see Cursor
  docs).
- Not a guide to which agent to pick (you'll likely use multiple).
- Not exhaustive across every coding agent (the principles
  generalize).

What you're locking in: **how to write a config file that survives
six months without rotting.** Steps 4–9 drill the writing.
