## The thirty lines you've already written, productized

Every coding agent you use — Claude Code, Cursor, Aider, Continue, Cline, Codex CLI, OpenCode — is the same shape underneath. A user types something, the harness loads context (config files, recent edits, git state, open buffers), calls the model, parses the response, runs any tools the model asked for, sends results back, repeats. Chapter 16 had you write that loop. This chapter asks: what does Claude Code add on top, and could you build it yourself?

The answer to "could you build it yourself" turns out to be yes — minimum viable harnesses are around 200 lines of Python. The interesting questions are which of the *additions* are load-bearing (you need them) versus which are sugar (your particular workflow doesn't).

## The four layers every harness has

1. **Input prep** — load the config files (CLAUDE.md, AGENTS.md), gather context (recent diffs, open files, project structure), construct the messages list. This is where most production harnesses spend the most code, because "good context" is what separates Cursor's experience from a raw API call.
2. **Model call** — the actual `messages.create(...)`. Boring, but harnesses differ on prompt-cache strategy, retry logic, streaming, and provider routing (some support multiple providers).
3. **Output parsing** — read `content` blocks, dispatch tool_use, accumulate text. Chapter 13 lesson 02 covered the primitive; harnesses wrap it with display logic and incremental rendering.
4. **Tool dispatch** — run the model's requested tools. Bash, file edits, web searches, git operations. The tool registry is what makes a harness *agentic* — the model can change the world, not just describe it.

Different harnesses emphasize different layers. Aider's strength is layer 1 (it's exceptional at gathering relevant context from a codebase). Cursor's strength is layer 4 (its tool palette and edit-application UX). Claude Code's strength is the *config layer* on top — CLAUDE.md hierarchy, hooks, slash commands.

## Why this chapter matters

Three reasons to learn what's in a harness:

- **You'll build one eventually.** Whatever you ship that uses LLMs will at some point need its own harness, even if narrow. The four layers are a checklist for what to build.
- **You'll choose between them more wisely.** Knowing what each tool optimizes lets you pick the right one for the task instead of using "whichever you opened first."
- **You'll debug them when they fail.** Harnesses are leaky abstractions; production failures usually happen *between* layers (context loaded badly, tool dispatched wrong, parsing missed a block). Knowing the layer model is how you triage.

## What AI specifically gets wrong

- **Building a "harness" that's actually just a wrapper around `messages.create`.** A harness without a tool registry is a chat client. Useful, but not what people mean.
- **Hardcoding the tool registry inside the loop.** When you want to add a tool, you edit the loop instead of registering one. Three tools later, the loop is unreadable.
- **Skipping retries.** Real provider APIs 429, 503, hit rate limits. A harness without retries crashes on transient errors and the user blames the model.
- **Loading the world into context "just in case."** Some harnesses dump everything in the project as context. Token bill explodes. The fix is *retrieval, not stuffing* — gather only what the current task needs.

## What you'll be able to do at the end

By the end of this chapter you'll have:

- Written a minimal harness — input prep, model call, output parsing, tool dispatch — in under 200 lines.
- Read Cursor's, Claude Code's, and Aider's docs and identified which layer each one optimizes.
- Spotted the four common harness bugs by reading code.
- Decided which tools to use for which tasks based on layer-level strengths, not feature lists.

After this chapter, the difference between "I use an AI coding tool" and "I understand what I'm using" stops mattering. They're the same sentence.
