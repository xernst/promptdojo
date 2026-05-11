---
xp: 1
estSeconds: 220
concept: eval-engineer-vs-prompt-engineer
---

# Why "eval engineer" eats "prompt engineer"

The labor-market argument is the cleanest way to understand why the
field has moved on. It has nothing to do with what's cool and
everything to do with what's *durable*.

## Durable artifacts vs ephemeral ones

A prompt is an ephemeral artifact. It is tuned for a specific model,
a specific use case, often a specific customer segment. When the
model changes — and the model changes every quarter — the prompt has
to be retuned. When the use case shifts, the prompt has to be
retuned. When the product team adds a new feature, the prompt has to
be retuned. The half-life of a production prompt in 2025 is
measured in weeks, sometimes days.

An **eval suite** is a durable artifact. It encodes "what does this
feature need to do for our customers" in a form that survives every
model swap, every prompt rewrite, every framework migration. The
eval suite a team wrote against GPT-4 in 2024 still runs against
GPT-5 in 2026, against Claude Opus 5 in 2027, against whatever ships
next. It is the *specification* of the product. The prompt is the
*implementation*.

This is the same distinction that makes test suites durable in
traditional software engineering. A C codebase from 1995 might be
unreadable today, but the test suite — if there is one — still tells
you what the code was supposed to do. The implementation gets
rewritten in Rust. The test suite endures.

## What this means for who gets hired

A "prompt engineer" was a person who knew which incantations made
GPT-3.5 sit up and beg. That skill aged badly. The incantations that
worked on GPT-3.5 are useless on GPT-5. The "trick" of prompt
engineering — knowing the model's quirks — is exactly the thing that
becomes worthless every six months.

An **eval engineer** — or "AI Engineer" or "LLM Engineer," titles
vary — is a person who can:

- Look at a fuzzy business problem and articulate it as a measurable
  outcome.
- Build a test set that covers the actual failure modes.
- Choose the right judge for each case (exact match, schema, LLM-as-judge,
  human review).
- Set up CI that runs the suite on every prompt change.
- Triage failures and decide which are bugs vs which are eval gaps.
- Maintain the suite as the product and the customer base evolve.

That skillset compounds. The eval suite a senior IC builds in year
one is still earning compound returns for the company in year five.
The cost to replace that person is enormous, because the eval suite
encodes years of accumulated product knowledge.

A prompt? Anyone can rewrite a prompt. A prompt engineer is fungible
on the timescale of one model release.

This is the labor-market argument. It is not "AI eats programmers."
It is "the durable skill in AI eats the ephemeral skill in AI." The
people writing eval suites today are doing what test engineers
discovered in the early 2000s: building the artifact that keeps
paying off long after the prompt-of-the-month is gone.

## Tie to the AI-native thesis

This connects directly to the AI-native discussion from chapter 26.
That chapter argued that companies have "process debt" — the
unspoken-in-someone's-head workflows that bottleneck AI adoption.
The eval-suite equivalent is **eval debt**: the gap between "we
think our AI feature works" and "we can prove it works on the
inputs that matter to our customers."

Every AI team has eval debt. The eval-mature ones have a number on
it (we have 200 cases, we add 5 per week, we run CI on every prompt
change). The eval-debt-laden ones don't even know how big the
problem is, because they have nothing to measure.

The strategic implication for your career is the same one the
AI-native thesis applied to companies: **the durable career assets
in AI are the ones that survive a model swap.** That means:

- Knowing how to build eval suites (durable; survives every release)
- Knowing how to design agent harnesses (durable; survives prompt
  rewrites)
- Knowing how to do evidence-based product work in AI (durable;
  survives the hype cycle)

Not durable: knowing the magic phrase that makes GPT-4 produce
better JSON than GPT-4-turbo. By the time you've memorized it, it's
already a fossil.

## The synthesis

The 2022-2024 era rewarded people who could make a model do a thing
once. The 2024-onward era rewards people who can prove a model will
do a thing reliably across the inputs the business cares about. That
is a different skill, a different role, and a different career path.
Hamel named it. Yan systematized it. Shankar gave it academic
grounding. Anthropic codified it. Braintrust productized it.

The field has chosen. The prompt engineer of 2023 is a 2024 fossil.
The eval engineer of 2025 is the senior IC of 2030.

In the next step, you'll build the audit you can run on any team —
yours, your future employer's, your startup's — to figure out which
era they're operating in.
