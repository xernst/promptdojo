---
xp: 1
estSeconds: 220
concept: working-backwards
---

# Start with the behavior you want, derive the harness

The most common mistake in harness engineering is starting with the harness. "Let me add a Linear MCP server." "Let me write a CLAUDE.md." "Let me set up a hooks framework." None of these starts produce a good harness, because none of them name *what behavior they're trying to produce*.

Osmani's prescription is the inverse, and it borrows directly from Amazon's "working backwards" product-management discipline:

> **Start with the behavior you want from the agent. Derive the harness component that delivers that behavior. If you can't name the behavior, remove the component.**

This is the *justification audit*. Every piece of harness has to answer the question "what observable behavior does this exist to produce?" If the answer is "I don't know," the piece is debt.

## The working-backwards pattern, applied

Three examples of the practice running forwards (good) vs the reverse (bad).

**Bad direction — start from the tool**:
- "I added a Postgres MCP server because Postgres is important."
- *What behavior does it enable that the agent couldn't do before?* Nobody on the team can name one.
- *What new failure modes does it open?* Unknown — nobody audited the MCP server's prompt-injection surface.
- Result: harness now has a tool that runs SQL on production. Risk added; capability unclear.

**Good direction — start from the behavior**:
- "We want the agent to be able to look up which user accounts were active in the last hour, without humans copying SQL into chat."
- *What's the smallest harness component that delivers this?* A scoped read-only Postgres MCP with a single tool: `active_users_last_hour()`.
- *What's the eval?* Replay a recent debugging session where the engineer wasted ten minutes on this query; show the agent now does it in one tool call.
- Result: one tool, named purpose, demonstrable behavior change, measurable eval.

**Bad direction — start from the rule**:
- "I added 'always run tests before declaring done' to AGENTS.md because that seems good."
- *Did the agent actually fail this way?* "Probably?"
- *What's the post-add behavior change?* Unknown.
- Result: another line of attention tax, no evidence it does anything.

**Good direction — start from the behavior**:
- "Agent declared done on a TypeScript edit; we ran `tsc` and got 12 errors."
- *What behavior do we want?* Agent never declares done on TS edits without a passing tsc.
- *What's the smallest harness component that enforces it?* A post-edit hook that runs `tsc --noEmit` on every TS write; on failure, injects errors into the next turn.
- *Could a rule alone do this?* No — rules are advisory, hooks are enforcement.
- Result: the model can no longer skip the check, even if it wanted to.

## The component-justification audit

Once or twice a quarter, walk every component of your harness and ask:

| Component | What behavior does it produce? | When would it become unnecessary? |
|---|---|---|
| AGENTS.md line about Tailwind | Agent uses Tailwind classes instead of inline styles | Project-wide Tailwind enforcement at lint level |
| `linear-cli` custom CLI | Agent reads Linear issues without 4000-token MCP overhead | Linear MCP server gets a lightweight mode |
| Post-edit tsc hook | Agent never declares done on broken TS | Model is post-trained to always run tsc |
| Reviewer subagent | Catches commented-out tests before PR opens | Pre-commit hook covers this surface already |

For each row, if either column is blank, the component is debt. Remove it or rewrite it with explicit purpose.

## Why this discipline is hard

Three reasons it's harder than it sounds:

- **Vanity additions.** Adding things feels productive. Removing things feels like loss aversion's enemy. Most teams add liberally and remove never.
- **Justifying everything is uncomfortable.** When you start the audit, you'll find components you can't justify. The instinct is to invent a justification post-hoc. Resist; the rule is "remove if you can't justify *without re-rationalizing*."
- **The model keeps catching up.** Components that justified themselves six months ago may not justify themselves now. Working-backwards means re-running the audit on a cadence, not as a one-time exercise.

The reward for doing this is that your harness stays *legible*. Six months from now, you (or a new team member) can read AGENTS.md top to bottom and understand exactly why each line exists. That legibility is the difference between a harness that compounds and a harness that decays.

## What the next step gives you

The next read is on the *ratchet log* itself — the artifact you use to make working-backwards durable across time. Each entry has the failure, the rule, and the removal criteria. The log is the place the discipline lives.

After that, a multiple choice on which existing line to remove. Then the two write drills.
