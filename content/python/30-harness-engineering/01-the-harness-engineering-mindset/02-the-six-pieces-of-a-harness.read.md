---
xp: 1
estSeconds: 220
concept: the-six-pieces
code: |
  PIECES = [
      "1. config       — CLAUDE.md / AGENTS.md / skill files / system prompts",
      "2. tools        — built-in tools, MCP servers, custom CLIs",
      "3. infra        — filesystem, sandbox, headless browser, db access",
      "4. orchestration — subagents, planner/executor splits, routing",
      "5. hooks        — pre-tool guards, post-edit checks, backpressure",
      "6. observability — traces, logs, cost, latency, evals",
  ]
  for p in PIECES:
      print(p)
---

# Six pieces, every modern coding-agent harness has them

The "harness" is a category word. Inside the category, there are six identifiable pieces. Every modern coding agent harness — Claude Code, Cursor, Aider, Codex CLI, Cline, Continue — has all six. They differ on where the investment is heaviest. They never differ on whether a piece exists.

Memorize the six. The audit drill at the end of the lesson scores harnesses across exactly these six dimensions.

## Piece 1 — Config

The static text the model sees on every turn. Two flavors:

- **Always-loaded**: CLAUDE.md (Claude Code), AGENTS.md (Codex CLI), `.cursorrules` (Cursor), `.continuerules` (Continue). Project-level guardrails that get injected into every system prompt.
- **Loaded on demand**: skill files (Claude Code's `/skills` directory), slash-command prompts, role-specific subagent system prompts.

The bigger your config-piece investment, the more your harness encodes opinions about how the model should behave. Production harnesses keep CLAUDE.md under 60 lines (HumanLayer's published number) and offload everything else to skill files.

## Piece 2 — Tools

What the model can DO besides talk. Three sub-categories:

- **Built-in tools**: filesystem (`Read`, `Edit`, `Write`), shell (`Bash`), web (`WebFetch`, `WebSearch`), agent-internal (`TodoWrite`).
- **MCP servers**: out-of-process tool registries that bolt on (Linear, GitHub, Postgres, Slack). The Model Context Protocol spec.
- **Custom CLIs**: a tiny shell command (e.g., `linear-cli list-issues`) that wraps an external API in fewer tokens than an MCP server would. HumanLayer explicitly recommends these over MCP for high-volume integrations.

Osmani's rule: **"Ten focused tools outperform fifty overlapping ones, because the model can hold the menu in its head."** Tool bloat is the most common harness sin.

## Piece 3 — Bundled infrastructure

The execution environment the tools run inside:

- A real filesystem (not just in-memory state).
- A sandbox (Daytona, E2B, Modal, Vercel Sandbox, or a local Docker container) for risky shell.
- A headless browser (Playwright, BrowserBase, Vercel agent-browser).
- A database connection, a Redis cache, a long-running daemon for background tasks.

This is where the "agent" stops being "a chat that calls APIs" and becomes "a process with the same authority as a junior dev's laptop." If the model can `rm -rf /`, the harness is *underinvested in infra-piece sandboxing*.

## Piece 4 — Orchestration

How the harness composes multiple model calls or multiple agents:

- **Subagents** — a child agent with its own context window, its own tool subset, often a different system prompt. Claude Code's Task tool, Cursor's background agents.
- **Planner / executor splits** — one agent writes the plan, another agent executes it step-by-step. Anthropic's eval patterns describe this as "evaluator-optimizer."
- **Routing** — dispatch based on input type (code question vs deploy task vs research) to specialized subagents.

Single-agent harnesses skip this piece entirely. That's fine for chat. It is not fine for 40-step engineering tasks.

## Piece 5 — Hooks and middleware

Lifecycle scripts the harness runs *around* tool calls:

- **Pre-tool** — block or modify a tool call before it runs. The "don't `git push --force` to main" guard.
- **Post-tool / post-edit** — run a check after a write. The "run tsc and feed errors back into the loop" pattern (Claude Code calls these post-edit hooks).
- **Pre-commit** — run linters and tests before the model is allowed to declare the task done.
- **Backpressure** — feed errors from any of the above back into the next model turn so the model self-corrects.

Osmani's rule: **"Success is silent, failures are verbose."** Hooks should add nothing to context when they pass and everything they know when they fail.

## Piece 6 — Observability

What lets you debug, evaluate, and improve the harness over time:

- **Traces** — every model call, tool call, hook fire, with inputs and outputs.
- **Logs** — `~/.claude/projects/*/logs/`, Cursor's session history.
- **Cost & latency** — per-task tokens, per-tool time, P99 latency.
- **Evals** — replayable test cases the harness must keep passing. Terminal Bench, SWE-Bench, your own internal regression suite.

Without observability, the ratchet (next lesson) is impossible. You can't tighten a rule against a failure you can't see.

## The six on one page

| Piece | Concrete examples |
|---|---|
| **1. config** | CLAUDE.md, AGENTS.md, .cursorrules, skills |
| **2. tools** | Built-ins, MCP servers, custom CLIs |
| **3. infra** | Filesystem, sandbox, browser, db |
| **4. orchestration** | Subagents, planner/executor, routing |
| **5. hooks** | Pre-tool, post-edit, pre-commit, backpressure |
| **6. observability** | Traces, logs, cost, evals |

Every harness has all six. The interesting question — the question harness engineers ask — is *which one is your weakest piece, and what failure mode does that weakness produce?*

The next drill makes you answer that for four real agent failures.
