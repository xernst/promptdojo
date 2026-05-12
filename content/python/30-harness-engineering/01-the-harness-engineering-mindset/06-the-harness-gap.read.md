---
xp: 1
estSeconds: 220
concept: the-harness-gap
---

# Same model, two harnesses, two completely different scores

For two years the discourse asked "is GPT-5 smarter than Claude 4?" That question has the wrong shape. The right question is **"in *which harness* is GPT-5 smarter than Claude 4?"** The answer depends on the harness almost as much as on the model.

The cleanest receipt published in 2026 came from HumanLayer, citing the Terminal Bench 2.0 leaderboard:

- **Claude Opus 4.6 inside Claude Code**: ranked #33.
- **Claude Opus 4.6 inside a different harness**: ranked #5.

Same model. The harness changed. The model rocketed 28 places (±4 positions per HumanLayer's stated margin).

This is *the harness gap*. It is the gap between what a model can theoretically do and what you see it do. The size of that gap is mostly a function of how well the harness is built around it. Trivedy's framing again: **"If you're not the model, you're the harness."** The harness is the lever you actually pull.

## Why the gap is so large

Three reasons stack:

1. **Context shape matters more than context size.** Stuffing 100k tokens of "relevant" code into a context window can score worse than feeding 10k tokens of well-summarized state. Anthropic's published research and Chroma's "context rot" paper both make the same observation: models degrade non-linearly with context length, *and* the degradation is sensitive to how much of the context is noise vs signal.
2. **Tools shape behavior.** A harness with a Linear MCP server + 40 tools makes the model spend half its attention reading the tool menu. A harness with one custom `linear-cli` command and three carefully scoped tools makes the model spend its attention on the task. Different harnesses → different effective intelligence.
3. **Post-training amplifies whatever harness the lab used.** Anthropic post-trains Claude on Claude Code's harness shape (filesystem operations, bash, the Task subagent). OpenAI post-trains GPT on Codex's harness shape. When you put one lab's model in a *different* lab's harness, you're betting against the post-training distribution. Sometimes you win. Often you don't.

That third point is what Osmani means when he writes about *the model-harness co-training feedback loop*. The "best" harness is partly the one that matches your model's post-training. This is now a published concern, not a hypothesis.

## The practical implication

Stop comparing models in the abstract. Compare models *inside the harness you'll actually ship*. If your team's harness is Claude Code with five MCP servers and a 200-line CLAUDE.md, the model evals that matter are the ones run in that exact configuration. Public benchmarks are a weak signal at best.

Two consequences for daily work:

- **Improving your harness is usually a bigger lever than switching providers.** Tightening AGENTS.md, deleting two redundant MCP servers, adding a post-edit hook — any of those tend to outperform a model upgrade on the tasks your team actually does.
- **A "model change" is also a "harness change."** When you swap providers, you're swapping into a context where the post-training feedback loop runs against you. Sometimes that's still the right move. Always know what you're trading.

## What harness engineers do differently

The mental shift from "model-first" to "harness-first" is small but produces different work. Concretely:

- **Model-first developer**: tries a task, fails, switches providers, posts on X about whether the model is dumb.
- **Harness-first engineer**: tries a task, fails, asks *which of the six pieces is weakest for this task*, fixes that piece, retries.

The second one ships more software. That's the whole post.

## What you'll build next

The exercise that follows is the audit drill. You'll write `audit_harness(setup)` that takes a dict describing a harness (six booleans, one per piece) and returns a score + the list of missing pieces. Two real-ish harnesses get scored: a Claude Code-style setup that has most pieces, and a raw-API-call wrapper that has almost none.

This is the function you'll actually want to keep in a `harness-tools/` directory. It's how the next chapter's ratchet-log work begins — you can't ratchet what you haven't audited.
