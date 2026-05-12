---
xp: 1
estSeconds: 130
concept: agent-config-file-purpose
code: |
  # what each agent's startup config file is called and where it lives.

  AGENT_CONFIGS = {
      "Claude Code":     "CLAUDE.md (root + nested folders)",
      "Codex CLI":       "AGENTS.md (open standard, also read by GitHub's coding agents)",
      "Cursor":          ".cursor/rules/*.mdc (one rule per file, optionally globbed by path)",
      "Cline (VS Code)": ".clinerules (root) + .clinerules-* per workspace",
      "Aider":           "CONVENTIONS.md (passed via --read or auto-loaded)",
      "Continue":        "config.json prompts + .continue/rules/*.md",
  }

  for agent, config in AGENT_CONFIGS.items():
      print(f"{agent:18}→ {config}")
runnable: true
---

# The most-leveraged prompting work you'll do is in a markdown file

Lesson 01 set up the six-knob prompt scaffold for a single
prompt. Lesson 02 distinguished few-shot from CoT for different
model classes. This lesson is the meta-version: **how to write the
config file your AI coding agent reads at the start of EVERY
session.**

The names differ by tool, but the pattern is identical:

| Agent | File | Loaded when |
|---|---|---|
| **Claude Code** | `CLAUDE.md` (root + nested) | Every session start; nested files merge with parent |
| **Codex CLI** + GitHub Copilot's coding agent | `AGENTS.md` (open standard) | Every session start |
| **Cursor** | `.cursor/rules/*.mdc` | Per-file or per-path; can be glob-scoped |
| **Cline** | `.clinerules` (root) + variants | Every session |
| **Aider** | `CONVENTIONS.md` | When passed via `--read` |
| **Continue** | `.continue/rules/*.md` | Per workspace |

Together, these are sometimes called "agent config files" or
"agent rules files." If you ship a project that other people will
use AI agents on, **the config file is your highest-leverage
contribution to their experience** — it's the prompt every model
sees, before it sees anything else.

## What goes in (and what doesn't)

The file is a system prompt. The model reads it once per session,
keeps it in context, and uses it as the basis for every decision
that follows. So:

**Belongs in the file**:
- **Project-specific conventions** the model can't infer ("we use
  pnpm, not npm; tests live in `tests/`, not `__tests__/`").
- **Anti-patterns to avoid** that this codebase has previously
  shipped ("don't use `any` in TypeScript here; use `unknown` and
  narrow").
- **Where to look** for things the model will need ("API routes
  live in `app/api/`; components live in `components/`").
- **Forbidden moves** the model would otherwise default to ("never
  modify the legacy `v1/` directory; it's frozen").

**Does NOT belong**:
- General-purpose advice the model already knows ("write good
  code," "be helpful").
- Long explanations of WHY (link to a doc instead — the model can
  read the link if needed).
- Examples that duplicate what the codebase already shows. The
  model can grep.
- Out-of-date references to deleted files or renamed APIs.

## The hierarchy: nested files override

Claude Code, Cursor, and Cline all support nested config files.
The pattern: `CLAUDE.md` at the root applies to everything;
`apps/web/CLAUDE.md` adds rules for that subdirectory. Rules merge
top-down — root rules apply everywhere, leaf rules add specificity.

This means a monorepo CAN have:

```
CLAUDE.md                 # global: pnpm, prettier, tests live here
apps/web/CLAUDE.md        # web app: Next.js conventions, no css-in-js
apps/api/CLAUDE.md        # api: fastify route patterns, no globals
packages/ui/CLAUDE.md     # ui kit: shadcn install pattern, accessibility rules
```

Each leaf is short (5–20 rules); the global is short (10–30 rules).
Total: hundreds of lines distributed across the tree, never more
than ~30 lines loaded for any single context.

## What the model actually does with it

The agent reads the file on session start, places it in the
system prompt or as a leading user message (depends on the
agent), and then ignores it for the rest of the session UNLESS
something it does triggers a rule.

The bug this fixes: without a config file, every new agent
session has to re-discover your conventions by trial and error.
You waste tokens and patience teaching the same lesson every day.
With a config file, the rules carry over.

## What you'll build

A `validate_claude_md(text)` that scores a config file on the four
heuristics that separate a good one from a bad one: terse,
actionable, links instead of duplicating, no fluff. Then the bug
fixes for the most common rot patterns: vague rules and stale
pointers.
