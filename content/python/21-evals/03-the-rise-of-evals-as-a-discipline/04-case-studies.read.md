---
xp: 1
estSeconds: 220
concept: eval-case-studies
---

# Three case studies: who shipped, who walked back

Theory only takes you so far. The eval turn is a real thing because
specific companies, with specific products, learned specific lessons
the hard way. Three worth knowing.

## Cursor: the eval harness that ate the IDE

Cursor — the AI-first code editor that grew faster than any developer
tool in history — is the most-referenced internal case study in
present-day AI engineering. The Cursor team is famously eval-heavy.
Anthropic engineers have referenced Cursor's harness in talks and
blog posts (search Anthropic's developer-relations content) as an
example of what mature eval discipline looks like in production: a
harness that ships hundreds of cases against every prompt change,
catches regressions before users see them, and lets the team upgrade
to new model versions on day-one of release.

The interesting thing about Cursor is not that they have evals.
Everyone "has evals" by 2025. The interesting thing is that the eval
suite is treated as the *primary artifact*. The prompts are
disposable. The agent harness is disposable. The model bindings are
disposable. What persists across all the rewrites is the eval suite —
because it encodes the team's accumulated knowledge of "what the
product is supposed to do." When GPT-5 ships, Cursor doesn't rewrite
the product. They run the suite, see what breaks, adjust the prompts
to fix the breaks, and ship the new model. The eval suite is the
specification. The prompt is implementation detail.

This is the bar. If your eval suite cannot serve as a spec, you do
not have an eval suite. You have a smoke test.

## Klarna: the walk-back

In May 2024, Klarna announced — proudly — that its OpenAI-powered
customer service bot had replaced the work of 700 full-time agents.
The press loved it. By mid-2025, Klarna was quietly hiring human
agents back. Sebastian Siemiatkowski (CEO) acknowledged in a
*Bloomberg* interview that AI-only support had hurt service quality
and the company was rebuilding a human-in-the-loop tier.

There are a half-dozen lessons in the Klarna walk-back, but the one
relevant to this chapter is this: Klarna's AI bot did not get
*worse* over time. The models, in fact, got better. What happened
was that Klarna's eval coverage was demo-grade — they had launched
on the inputs they'd tested, and the long tail of real customer
interactions hit failure modes their internal evals had never
flagged. The bot was confidently wrong on things it should have
escalated, confidently bland on things customers needed empathy on,
and confidently helpful on things that needed a refund-policy lookup
it didn't have. Without eval coverage on those edge categories, the
team couldn't even *see* the problem until customer satisfaction
metrics fell off a cliff.

Klarna didn't fail because they used AI. They failed because they
shipped AI without an eval suite that could measure the failure
modes that actually mattered to customers. The walk-back wasn't a
referendum on AI customer service. It was a referendum on
shipping-before-measuring.

## Anthropic: "eval-driven development" becomes a mantra

Anthropic — the company that publishes "Building Effective Agents"
— has been the most explicit about eval-driven development as
*practice*, not just a slogan. The phrase shows up in their public
talks, their docs, their cookbook. The pattern is consistent across
every Anthropic-published recipe for agent design:

1. Start with a small, hand-built eval set (50 cases is plenty).
2. Build the simplest agent that passes 80% of the set.
3. Look at the failures. Find the common failure modes.
4. Either fix the agent or, more often, *expand the eval set* with
   cases that capture the failure mode.
5. Iterate.

The mantra is: **evals come first, prompts come second, framework
choice comes third**. If you don't know what you're trying to
measure, no amount of framework cleverness will save you.

## The pattern across all three

The pattern across Cursor, Klarna, and Anthropic is the same — and
it's the central, slightly counterintuitive thesis of the eval era:

> **The teams with the heaviest eval discipline ship faster, not
> slower.**

This sounds wrong on the first hearing. Adding tests slows you down,
doesn't it? In the LLM context, no — and the reason is that the
*alternative* to eval discipline is not "no overhead, just speed."
The alternative is *the silent regression*: the change you shipped
that worked on three inputs and broke seventeen, that you didn't
notice for six weeks, that you then spent two months debugging
because you had no way to isolate when it started. Eval-mature teams
trade five minutes of CI time for not having that six-week
debugging cycle. The net is enormous velocity.

The teams without evals look fast from the outside in week one.
They are dead in the water by month six.

In the next step we'll codify this into a question you can apply to
any team you join or start: are they eval-first, or prompt-first?
