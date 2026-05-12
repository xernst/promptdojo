---
xp: 1
estSeconds: 220
concept: harnesses-move
---

# Smarter models don't reduce harness work; they relocate it

The seductive belief is that better models will eventually eat the harness. "Why bother engineering all this scaffolding? Claude 5 will just do it natively." This belief has been wrong every time it's been tested.

Osmani's framing of the dynamic, near-quoted: the harness doesn't get simpler as models get better — the surface area it covers shifts. New capabilities open new failure modes; the harness moves to cover them.

Concretely: when a model gets better at one capability, the corresponding harness component becomes obsolete. *But the harness as a whole doesn't shrink.* New failure modes open up at the new performance ceiling, and new harness components grow to address them.

This is the *moving harness* dynamic. Three concrete examples.

## Example 1 — Tool-call argument validation

**Then (2023-2024)**: GPT-4-class models would routinely call tools with malformed arguments. The harness had to validate every tool input against a JSONSchema, gracefully retry on validation errors, and sometimes refuse and ask for clarification. This was maybe 50-100 lines of harness code per project.

**Now (2026)**: Modern models almost never produce malformed tool arguments. The validation layer fires rarely; most teams have stopped adding it for new tools, and some have removed old validators.

**Did the harness shrink?** Not really. The work moved to: validating *what the model is trying to do with the tool*, not whether it formatted the call correctly. "The model asked to delete this file — should it?" replaces "The model asked to delete this file — is the JSON well-formed?"

## Example 2 — Step-by-step prompting

**Then**: Every system prompt told the model to "think step by step." Without this incantation, models would skip reasoning and produce incoherent answers. The instruction was load-bearing.

**Now**: Modern models reason by default. The line is obsolete. Most modern AGENTS.md examples don't include it.

**Did the harness shrink?** A line was removed — but the team's attention on reasoning didn't shrink. It moved to *plan files* (lesson 04). The model's raw outputs are fine — when sampled with no harness around them, the next-token distributions on reasoning-heavy tasks are accurate by default. The harness now makes that reasoning *durable* by writing it to disk so it survives context rot.

## Example 3 — Tool-call retry loops

**Then**: Models would forget which tool they were in the middle of using after a few turns. Harnesses had retry loops to recover.

**Now**: Models track tool-call state across many turns without prompting. The retry logic fires rarely.

**Did the harness shrink?** The retry code shrank, but **multi-day memory** became a problem — long-running agents need to remember state across sessions, restarts, even days. New harness component grows: persistent memory layer. The total harness code is bigger, just *located elsewhere*.

## The general principle

Every harness component encodes an assumption about what the model can't do alone. When that assumption changes, the component is debt. **But the ceiling of expectations rises along with the model.** A few months later, you're attempting tasks you wouldn't have attempted before, and *those* tasks have new failure modes that need new components.

It is, in this sense, an arms race the harness keeps winning — *and* keeps having to fight.

## What this means for your engineering investment

Three practical consequences:

1. **Don't over-invest in any single component.** A component that solves a current model limitation may be obsolete in six months. Build for current pain; don't gold-plate. The harness will move.
2. **Do invest in the *patterns* (the six pieces, the four reflexes, the three mitigations).** The patterns are stable across model generations. The specific implementations rotate.
3. **Audit on a cadence.** Lesson 02's ratchet log has a `remove_when` field for exactly this. Re-evaluate quarterly. Components that have been rendered native by model improvements come out; new components fill the gap.

## What this rules out

Two reflexes that the *moving harness* framing should kill:

- **"Wait for the next model release; the problem will solve itself."** Sometimes it does. Usually it doesn't, and even when it does, a new problem opens up that's just as hard to solve.
- **"Our harness is finally done."** A harness is never done. The moving target is the entire point. A team that says "we don't need to touch the harness anymore" is a team about to discover their old assumptions are now wrong.

## The framing one more time

Trivedy's framing — Agent = Model + Harness — is shorthand for a real observation: the model is one input among many, and the engineering work that distinguishes good agents from bad ones is the work AROUND the model, not the choice OF the model. As the model gets stronger, you'd think the harness gets smaller. The empirical reality: the harness moves, the *expectations* expand, the engineering investment stays roughly constant — just redistributed across different components.

This is why harness engineering is a *durable* discipline. Even if model progress accelerates, the engineering work doesn't disappear. It rotates.

## What's next

The overfitting feedback loop reading — why your "best" harness is partly the one that matches your model's post-training distribution. Then MCP security as a prompt-injection surface. Then the picks-the-debt drill, the build-vs-buy write step, and the portfolio-routing checkpoint.
