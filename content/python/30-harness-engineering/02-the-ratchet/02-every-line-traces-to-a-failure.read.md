---
xp: 1
estSeconds: 220
concept: every-line-traces-to-a-failure
---

# The pilot's checklist test for every line in your prompt

Osmani's load-bearing sentence in *Agent Harness Engineering*, lightly paraphrased to capture the spirit (the exact wording in the post: "every line in a good AGENTS.md should be traceable back to a specific thing that went wrong"):

> **"Every line in a good system prompt should trace back to a specific, historical failure."**

This sentence is doing the work of an entire engineering principle. Read it twice.

The metaphor underneath it is the pilot's checklist. Every item on the pre-takeoff checklist for a Boeing 737 traces to a specific crash, a specific near-miss, or a specific incident the FAA investigated. Nothing on the checklist is theoretical. Nothing is "we thought it might be a good idea." Every line earned its place because not having that line cost lives.

The harness-engineering parallel is exact. **Lines in AGENTS.md / CLAUDE.md / .cursorrules / skill files are checklist items.** Each one is a guardrail against a recurring failure. If you can't say which failure a line is guarding against, the line shouldn't be there.

## The two-sentence test

For every line in your system-prompt-equivalent, you should be able to answer two questions in under five seconds:

1. **What failure did this rule earn its place against?** "Agent commented out a failing test on 2026-03-15." "Agent ran `git push --force` to main on 2026-04-02." "Agent kept using inline styles after we adopted Tailwind on 2026-02-20."
2. **What would have to be true for this rule to become unnecessary?** "The model is post-trained to never silently disable tests." "The harness has a pre-tool hook that blocks force-push to protected branches." "Tailwind enforcement is built into the model's project-context layer."

If you can answer both, the rule earned its place AND has explicit removal criteria. That's a ratchet entry.

If you can't answer #1, it's cargo cult. Delete it.

If you can't answer #2, it's debt. Tag it for re-evaluation.

## Why cargo-cult rules cost you

Every line in a system prompt is a tax. Three taxes, specifically:

- **Token cost.** Even with prompt caching, system prompts are budget. A 1,500-line AGENTS.md eats attention you'd rather have on the task.
- **Attention cost.** The model has to weigh every rule on every turn. The more rules, the more dilute each one's weight becomes. HumanLayer's published number: their team keeps CLAUDE.md under 60 lines on purpose.
- **Conflict cost.** Two rules can subtly contradict. When they do, the model picks one (often the wrong one). Fewer rules → fewer conflicts.

A cargo-culted AGENTS.md is worse than no AGENTS.md. It pretends to encode guardrails but actually trades attention for nothing.

## How harness engineers write rules

Two patterns the experienced practitioners use:

1. **Date-stamp every rule.** `# 2026-03-15 — never comment out a failing test; came up when agent disabled CartTest in PR #842`. The date and the citation make the trace unambiguous. When you re-audit the file six months later, you have the breadcrumb.
2. **Name the artifact, not the abstraction.** Bad: "Be careful with destructive commands." Good: "Never run `git push --force`, `rm -rf`, `DROP TABLE`, or `gh pr merge --admin` without explicit user confirmation." The model can't act on abstractions; it can act on specific strings.

These two patterns alone separate ratcheted rules from cargo-culted ones.

## The two-direction discipline

The ratchet metaphor implies one-way motion. In practice, the discipline has two directions:

- **Forward (add):** observed failure → new rule → date-stamped → committed.
- **Backward (retire):** stale rule → model now handles it natively (you can demonstrate this with an eval) → removed, with the removal also logged.

Forward is the easier direction; almost everyone gets there eventually. Backward is the habit most teams skip. They end up with a CLAUDE.md that grew from 30 lines to 300 over a year, half of those rules now redundant, the model's attention diluted.

Osmani is explicit about this in the post: **"Harnesses don't shrink, they move."** Lines get retired *as new failure modes open up*. The total volume of harness work doesn't shrink. But the *specific* lines should move — yesterday's pre-tool hook is today's model-native behavior is tomorrow's removed line.

## What you're about to drill

The next four steps are a tight loop on this exact discipline:

1. A multiple choice that makes you pick which of four AGENTS.md lines actually earned its place.
2. The "working backwards" reading — start with behavior, derive the rule.
3. The ratchet-log reading — what an actual log entry looks like.
4. A second multiple choice on which line to retire because the model now handles it natively.

Then two write drills: one that appends a new ratchet entry, one that audits which entries to remove. The checkpoint stitches them together.

The thing to keep in mind throughout: **the pilot's checklist is short on purpose.** Yours should be too.
