---
xp: 1
estSeconds: 200
concept: sonnet-territory
---

# Sonnet territory: reasoning, branching, the things that cost more if you get them wrong

Sonnet 4.6 is the default model for anything that doesn't have an
obvious answer to "could Haiku do this?" In 2026 it's Anthropic's
flagship general-purpose model — the one with the "best coding
model" reputation across the industry, the one Cursor's
agent-loop calls for the hard parts, the one Claude Code uses
for the bulk of its work.

When Sonnet is the right call:

- **Code generation and code editing.** Anything where the
  output gets executed. Haiku writes plausible Python that
  occasionally calls functions that don't exist. Sonnet writes
  Python that runs.
- **Tool use with branching logic.** Agent loops with 3+ tool
  calls per turn, multi-step planning, anything where the model
  has to decide what to call next based on what came back.
- **Long-context reasoning.** Pulling signal out of a 50-page
  document, summarizing across multiple sources, anything where
  the prompt itself is dense.
- **Customer-facing draft writing.** Emails, marketing copy,
  technical docs. Quality is visible to the recipient. The 10%
  Haiku gives up on prose quality is the 10% your customer
  notices.
- **Anything where the failure of a small model gets expensive.**
  The deciding question is: "if the model gets this wrong, what
  does it cost me to recover?" If recovery is cheap (re-run,
  human catches it), Haiku is fine. If recovery is expensive
  (customer sees the bad output, decision gets acted on, code
  ships), upgrade.

## The "best coding model" pattern

Sonnet 4.6's killer app is coding. When you're writing the kind
of code that gets executed — agent code, tool-using harnesses,
anything where syntax errors cost real time — Sonnet is the
right call by a wide margin. Haiku writes code that looks fine
and breaks on the second test case. Opus writes code that takes
30 seconds per turn and gives marginal improvements over Sonnet
for typical tasks.

This is why the major coding products (Cursor, Claude Code,
Cline) all default to Sonnet for the main agent loop. Cursor's
auto-routing only drops to Haiku for the inline autocomplete
fast-path, never for the agent's reasoning loop. The cost-quality
curve is just sharper on coding tasks than on prose.

## What "tool use with branching" looks like in practice

A simple agent loop is fine on Haiku: search for X, return the
result. Three steps, no branching, predictable shape.

A real agent loop looks like:

1. Read the user's request.
2. Decide which of 12 tools to call (and with what arguments).
3. Look at the result.
4. Decide whether to call another tool, ask a clarifying
   question, or return.
5. If another tool, go to step 2.
6. If a clarifying question, format it nicely.
7. If returning, summarize what was done.

The decision-making at steps 2, 4, and 7 is where Haiku starts
to drop calls. It picks the wrong tool, misinterprets the result,
or returns prematurely. Sonnet handles the same shape with
markedly higher reliability. Chapter 16 builds exactly this loop.

## The "would I let a junior do this" test

A useful heuristic, extending Karpathy's "eager intern" framing
into a worker-class hierarchy: if you'd let a junior engineer
handle the task with light supervision, Haiku can probably do it.
If you'd only let a senior touch it, go to Sonnet. If you'd want
a staff engineer or higher reviewing the output, go to Opus.

Junior-level tasks: classify, extract, format, summarize, follow
explicit instructions, fill in known templates.

Senior-level tasks: write code that compiles, plan multi-step
work, reason over long documents, draft customer-facing
material, debug a real stack trace.

Staff-level tasks: design a system, review a contract, decide
between architectural alternatives, anything where the answer
needs to be right because you're not going to re-run it.

The naming isn't arbitrary. Anthropic deliberately picked these
tiers to map to the way real engineering organizations divide
labor.

## When NOT to use Sonnet

Two patterns worth catching:

- **High-volume structured work.** If the task is classification
  or extraction at scale, you're paying for Sonnet's reasoning
  surface and not using it. Haiku will do the same job, faster,
  for less.
- **Rare, high-stakes deep reasoning.** Contract review, hard
  architecture, novel research. Sonnet is good but Opus is
  better, and the cost difference doesn't matter when the call
  runs once. Opus territory is next.
