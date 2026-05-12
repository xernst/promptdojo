---
xp: 1
estSeconds: 220
concept: project-shapes-that-ship
---

# The three shapes that consistently ship

Beginner agents that survive contact with reality fit into one of
three shapes. Not five, not ten — three. If your capstone pitch
doesn't map onto one of these, redesign it until it does. The
three shapes share a common backbone: bounded scope, observable
output, and a real user (even a user of one).

## Shape 1: Internal tool for one team

The agent lives inside a workflow that one specific team already
runs every day. It doesn't replace the team. It absorbs one
specific, repetitive decision the team currently makes by hand.
Volume is high (the team makes the decision dozens of times a
day), rules are explicit (the team can already explain what
makes a "good" decision), and the user is captive (they have to
use it or they break the workflow).

**The case study: CrowdTest.** Josh's CrowdTest is exactly this
shape. The wedge is a single agent decision inside a structured
testing workflow — one team uses it, the rules are written down,
the volume is enough to matter. It didn't try to be a general-
purpose QA tool. It picked one decision, made it well, and the
team is on the hook to use it. That's the whole game.

The capstone version of this shape: "An agent that triages every
incoming bug report for our 5-person eng team, classifies it
(bug / feature-request / ops issue), assigns priority against
the rubric in `/docs/priority.md`, and posts to the right Slack
channel." Volume: 20+/day. Rules: priority.md. User: the eng
team. Exit: classified + routed. Ships in a weekend.

## Shape 2: Content pipeline with eval

The agent generates structured content against an explicit
quality bar. Not "write good content" (which has no eval) but
"generate content matching this schema, passing these N checks."
The eval IS the spec. If the output passes the checks, ship it.
If it fails, iterate. The agent never has to be a creative
genius — it just has to be a reliable producer against a defined
quality bar.

**The case study: promptdojo itself.** The school you're reading
right now is generated content with an eval. Every lesson has to
fit the structure (read / mc / write / checkpoint), every
exercise has to be Pyodide-runnable, every stdout has to match
exactly, every concept has to be cited back to a real essay or
project. Those checks aren't aesthetic — they're testable. A
lesson either passes them or doesn't. That's why this project
ships content week after week instead of stalling.

The capstone version: "An agent that drafts product descriptions
for our e-commerce store from the raw spec sheet, formatted to
match the template, passing 5 explicit checks (length, banned
words, required fields, tone match against 3 reference samples,
no factual claims not in the spec)." Volume: dozens/week. Rules:
the 5 checks. Eval: pass/fail per check. Ships.

## Shape 3: Single-decision agent

The agent's whole job is to make one decision repeatedly. Not a
workflow — a decision. Inbound thing comes in. Agent reads it.
Agent outputs a structured verdict. Done. The verdict either
gets acted on automatically (auto-routing, auto-tagging,
auto-pricing) or it gets surfaced to a human as a recommendation
with confidence. Either way the agent owns *one* call.

**The case study: promptdojo.** Josh's promptdojo (the engine
behind this very lesson) uses a single-decision agent for
grading: given a learner's code submission, decide whether the
output matches the expected stdout. That's it. One decision.
Made many times a day. Explicit rules (stdout equality with
normalization). Observable exit (pass/fail). It doesn't try to
"help" the learner or "explain" their bug — those are different
agents, different decisions, different scopes. Each agent owns
one call.

The capstone version: "An agent that reads every inbound support
email and outputs `{category, priority, suggested_template_id}`."
Volume: every inbound. Rules: a category list + a priority rubric.
Output: 3 fields, all strings. Eval: human disagrees ≤10% of the
time on a held-out set.

## What all three shapes share

Same five properties. You'll see these formalized in the next
step as the wedge checklist:

- **Volume**: the agent's decision happens often enough that
  automating it actually matters (>10x/day at minimum).
- **Structured outcome**: the agent's output fits a schema you
  can write down (verdict + reason, or classification + label,
  or content matching a template).
- **Explicit rules**: the agent has a written-down rubric, style
  guide, schema, or set of categories to ground in. Not "use
  your judgment" — *rules*.
- **Single user or team**: there's exactly one person or one
  team that's accountable for using the output. Not "everyone."
  Not "the internet."
- **Observable success**: you can tell from the output alone
  whether the agent did its job. No "did it feel helpful?" —
  *did it match the expected shape, against the rubric, on a
  held-out test set?*

## What this excludes

This excludes most of what beginners *want* to build. It excludes
"AI tutor," "AI life coach," "AI research assistant," "AI
journalist," "AI therapist," and every other taste-driven,
relationship-heavy, judgment-dense ambition. Those projects fail
not because they're impossible but because *they're not capstone
projects*. They're the projects you build later, after you've
shipped three of these.

For now: pick a shape. Internal tool, content pipeline, or
single-decision agent. Build that. Once you've shipped one, the
rest of your career as a builder reads obvious.

Next step formalizes the five wedge signals into a checklist you
can run on any pitch.
