---
xp: 1
estSeconds: 200
concept: model-choice-as-product-decision
---

# Picking a model is a product decision, not a technical detail

The first two lessons taught you to make the call and read the
response. This lesson is about the parameter you set right before
you hit send: `model="..."`. The default move — copying whatever
model name your last tutorial used — is the most expensive habit
in shipping LLM features.

Picking a model is a three-axis decision:

1. **Capability** — can this model actually do the task well?
2. **Cost** — what does it cost per call × how many calls per day?
3. **Latency** — how long until the user sees the first token?

You optimize different combinations of those three for different
features. A real-time autocomplete cares about latency above all
else. A nightly batch summarizer doesn't care about latency at
all and lives or dies on cost. A contract review tool runs once
and cares only about being right.

Cursor's auto-routing is the canonical example. Inside the IDE,
some keystrokes go to a small fast model (Haiku-class for inline
suggestions), some go to a frontier model (Sonnet-class for the
agent loop), and the rare deep-reasoning tasks go to the biggest
model available. The user doesn't pick. The product picks for
them based on the shape of the request.

## Karpathy's framing: the "eager intern"

Andrej Karpathy publicly frames LLMs as an **"eager intern"** —
capable, fast, willing to do anything you spec clearly, but needs
the right scope of task. Extend that mental model into a worker-class
hierarchy and the model picker writes itself. Sonnet is your full-time
senior engineer — expensive, sharp, you give them the hard problems.
Haiku is your high-volume contractor — fast, cheap, perfect for
repetitive structured work you can clearly spec. Opus is the
consultant you fly in for the quarterly architecture review.

You don't pay your senior engineer to format CSV files. You also
don't ask your contractor to redesign your auth system. Match
the worker class to the task or you waste money and quality at
the same time.

## The three Claude models, named

Three model tiers from Anthropic in 2026, ordered by capability
(and cost):

| Model | In $/Mtok | Out $/Mtok | When |
|---|---|---|---|
| Claude Haiku 4.5 | $1 | $5 | high-volume, structured, fast |
| Claude Sonnet 4.6 | $3 | $15 | general-purpose, agents, code |
| Claude Opus 4.7 | $5 | $25 | rare, hard, high-stakes |

(Cite once: Anthropic public pricing, M-tok = million tokens.)

Read those numbers carefully. **Haiku is roughly 3× cheaper on
input and output than Sonnet. Opus is about 1.7× more expensive
than Sonnet.** A feature that calls the model a million times a
day will swing between $1,000 and $25,000 depending on which row
you pick. The choice is not academic.

## The volume × difficulty grid

The default move is: pick Sonnet for everything, ship, and
forget about it. That's fine until traffic scales. Then your
$300/month bill becomes $30,000/month and somebody has to go
audit every call site.

The instinct to build instead is: every time you write
`model=`, ask two questions in the same breath.

- "How many of these calls will I make per day?"
- "How hard is the task, really?"

High volume + easy task → Haiku.
Low volume + hard task → Opus.
Everything else → Sonnet.

That's the whole framework. The rest of the lesson is putting
edges on it.

## What you'll do in this lesson

Five read steps walking through Haiku territory, Sonnet territory,
and the Opus thinking-budget pattern. Two MCQs forcing you to
pick. One write step where you build a `pick_model(task)` router.
One checkpoint where you cost-out a daily workload and pick the
cheapest model that doesn't break quality.

For code-killa specifically — the open-source Python school I'm
building on a $0 budget — every dollar matters. Picking Sonnet
when Haiku would do is the difference between "this project
exists" and "this project ran out of API credits in week three."
You'll feel that same constraint in every indie product you ship.
