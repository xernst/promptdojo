---
xp: 1
estSeconds: 220
concept: context-rot
---

# "Bigger context window" is not the same as "more attention"

For three years the model labs have been racing to ship larger context windows. 128k, 200k, 1M, 2M tokens. The marketing reads as if a 1M-token window means you can stuff 1M tokens of stuff in there and the model will use all of it equally well.

It cannot.

Chroma published a paper in July 2025 (referenced by both Osmani and HumanLayer in their spring 2026 essays) that measured what happens to model performance as context length grows. The chart is the same shape every time, across every model tested: **performance degrades non-linearly with context length, and the degradation accelerates the further you get from the relevant signal.** The longer the context, the worse the model gets at finding what matters in it. This is now called *context rot*.

Two practical consequences:

- A 200k-token context window full of "relevant" code can score *worse* than 20k tokens of well-summarized state.
- The model's effective intelligence in a long task isn't determined by raw IQ. It's determined by how the harness manages the window.

Context engineering is the discipline of keeping the window short and signal-dense, even when the conversation gets long. Three primary techniques. Each gets its own step.

## The three mitigations, in one paragraph each

**Compaction.** Periodically summarize older turns into a compressed representation. Keep recent turns verbatim. Throw away or compress what's no longer load-bearing. Claude Code does this automatically when the window approaches the ceiling; the technique has a generic name now: *autocompact*.

**Tool-call offloading.** When a tool returns 2,000 lines of output, that output does *not* belong in the model's context. Write it to the filesystem (or an object store). Put a 5-line summary into context: "stored at `/tmp/build-output.log`, 2000 lines, here are the first 3 and last 3." The model can `cat` more on demand.

**Progressive disclosure.** Don't load every rule, every skill, every tool definition at session start. Load only what the current turn needs. Claude Code's *skills* are the production-grade example: each skill is a markdown file with its own tools and rules; they get loaded into context only when relevant.

These three are not exotic. They are not optional. Every production-grade harness — Claude Code, Cursor, Codex CLI, Cline — does all three. The difference between a good harness and a bad one in 2026 is usually one of these three is missing or broken.

## Why context rot is the most-underestimated harness problem

Three reasons:

1. **It's invisible at the start of a session.** The first ten turns work fine. The window has plenty of room. The agent feels smart. By turn forty, the window is full, the model's attention is scattered, and the agent starts forgetting things you told it at turn three. By the time you notice, you've spent an hour.
2. **The model doesn't know it's rotting.** It can't tell you "I'm at 87% of my context budget." Most harnesses don't surface this to the user either. The first signal is usually drift in the output quality, which most people misattribute to model badness.
3. **The "obvious" fix is wrong.** "Just use a bigger context window" extends the problem, doesn't solve it. The bigger the window, the more material the harness has to mismanage. Adding context is easier than managing it; harness engineers prioritize the harder thing.

The right framing: **context is a budget you spend, not a window you fill.** Lesson 04 will make you write a function that allocates that budget across competing items.

## How harness engineers actually work

Three habits that distinguish context-aware harness work:

- **Measure token usage on every turn.** If your observability piece (lesson 1) doesn't track tokens-in / tokens-out per turn, you have no way to see context rot building. Add it.
- **Define thresholds.** Most teams trigger compaction at 70-80% of the model's context window. Some teams aggressively compact at 50%. The right answer depends on task length and how recoverable a stale summary is for your domain.
- **Plan for the long horizon up front.** A 5-turn chat doesn't need progressive disclosure. A 40-turn refactor does. Pick the harness shape that matches the task shape; don't reach for compaction at turn 30 of a session that should have been planned for at turn 0.

## What's next

The next three steps walk through each of the three mitigations in detail. Then a multiple choice that makes you pick the right mitigation for four context-bloat scenarios. Then the memory-hierarchy reading and a data-classification drill. Then the budget-planning write step and the checkpoint.

By the end of this lesson you will be writing a function that allocates a token budget across competing items and decides which to load now, which to offload, and which to fetch on demand. That function is the heart of every production harness's context layer.
