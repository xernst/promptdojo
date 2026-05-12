---
xp: 1
estSeconds: 220
concept: fine-tune-when-style
---

# Fork 3: Fine-tune — when style or format is the product

Fine-tuning is the most misunderstood fork. Most teams reach for
fine-tune when they want the model to "know" their data. That is
almost always the wrong reason. Fine-tune is bad at facts. Fine-tune
is bad at freshness. Fine-tune is bad at citations. Fine-tune is
bad at debugging.

What fine-tune is good at: **changing how the model writes**.
Domain language, formatting conventions, house style, output
structure, tone. The capability gap, not the knowledge gap.

## Harvey AI is the canonical example

Harvey AI, the legal-tech unicorn at $5B+ valuation, made fine-
tuning legible to the AI industry. Harvey's earlier strategy
(2023-early 2024) was to fine-tune on legal style. Their pitch
wasn't "we know more case law than GPT-4." Their pitch was:
**we know how lawyers write**.

Specifically:

- The structure of a legal memo (issue, rule, application,
  conclusion).
- The voice ("the court found" vs "the court held").
- The citation format (Bluebook).
- The hedge language ("plaintiffs may be entitled to" vs "the
  plaintiff is entitled to").
- The willingness to flag uncertainty in a specific way that
  matches how partner-track associates flag uncertainty.

None of that is a knowledge gap. GPT-4 had read case law. What
GPT-4 didn't have was the rhythm of how lawyers want their outputs
to read.

By May 2025, Harvey publicly pivoted to using multiple foundation
models (Anthropic, Google, OpenAI) with task-specific routing and
workflow orchestration, after frontier reasoning models beat their
custom model on their own BigLaw Bench eval. The lesson is the
same: fine-tune for style and format, not facts — but the receipts
say even style-fine-tuning lost ground when frontier reasoning
improved.

This is the right shape for fine-tune. The product wedge is the
style and format. The facts are still going to be wrong sometimes
(no model is fact-clean on case law), but the OUTPUT looks
authoritative in the way the customer needs.

## Why fine-tune fails for facts

Fine-tune fails on facts for three reasons that compound:

1. **Frozen knowledge.** The model knows what was in its training
   data at training time. New case law decided yesterday is
   invisible to the model. RAG would have caught it; fine-tune
   can't. Every retraining cycle is a chance to fix this, but most
   teams retrain quarterly at best.
2. **No citations.** When the model outputs a fact, you cannot
   point to where the fact came from. Was it in your training set?
   Was it hallucinated? Was it adjacent to your training set and
   the model interpolated? Nobody knows. RAG hands you the chunk
   that produced the answer. Fine-tune hands you a vibe.
3. **Hallucination still happens.** Fine-tuning on facts does NOT
   make the model stop hallucinating. It makes the model
   hallucinate in your domain language, with your formatting,
   confidently. This is sometimes worse than baseline because the
   output looks authoritative.

The teams that fine-tuned on facts in 2023-2024 mostly got crushed
when retrieval-augmented systems caught up. The teams that fine-
tuned on style and format kept their moat.

## The cautionary tale: the legal-tech that fine-tuned and got crushed

A legal-tech startup (not Harvey) raised a $30M Series A in 2024
on the back of "we fine-tuned a model on US case law." Their demo
was beautiful. The model could discuss landmark cases, cite them
in Bluebook format, and write briefs that read like a junior
associate wrote them.

Two problems hit them in 2026:

1. **GPT-5.5 ships with 1M-token context and the legal-eval gap
   closed.** Long-context with proper case-law retrieval matched
   their fine-tuned model on style and BEAT it on facts (because
   the long-context system could pull in cases that hadn't
   existed when they fine-tuned).
2. **Their retraining cycle was 8 weeks.** Every 8 weeks they
   retrained. In between, the model was wrong about anything new.
   Their customers (BigLaw associates) noticed. The product's
   freshness reputation eroded.

By Q2 2026 their renewal rate had fallen below 40%. They pivoted
to a RAG-over-fine-tune-base architecture (fine-tune for style,
RAG for current case law) but by then the market had moved.

The lesson is not "don't fine-tune." The lesson is **fine-tune for
the right axis**. Style, format, domain language — yes. Facts —
no.

## When fine-tune wins

The dominance conditions for fine-tune:

- **The capability gap is in HOW the model writes.** Tone,
  structure, format, domain language. The model needs to produce
  outputs that match a specific voice or template.
- **The output template is stable.** Bluebook citations don't
  change weekly. Legal memo structure doesn't change quarterly.
  The thing you're fine-tuning ON has to be stable enough that
  your training data is still relevant 6-12 months out.
- **You have the data.** Fine-tuning on a few hundred examples
  rarely moves the needle. Harvey fine-tuned on millions. You
  need a corpus of well-formatted, vetted examples in the target
  style.
- **You're willing to operate a retraining pipeline.** Fine-tune
  is the only fork that has an MLOps cost. You need an eval
  harness, a retraining cadence, rollback plans.

## The honest case for hybrid (fine-tune + RAG)

The shape that wins in practice for vertical AI products is often
**fine-tune for style + RAG for facts**. Harvey-shaped companies
look like this internally: a fine-tuned base model that writes
like a lawyer, with RAG pulling in current case law at query time.

This is the architecture the legal-tech-that-got-crushed pivoted
to. It's the one Harvey actually ships. It's the one most "AI for
[vertical]" companies converge on after they've shipped enough to
see where each fork wins.

The decision rubric for hybrid is: pick fine-tune as the BASE if
style is critical, pick RAG as the augmentation if freshness is
critical. Most professional-services verticals (law, accounting,
medical, consulting) have both, so they end up hybrid.

## What this fork teaches

- **Fine-tune is the capability fork.** Pick it when style,
  format, or domain language is the product. Don't pick it for
  facts.
- **Harvey is the proof point.** They fine-tuned on style and
  built a $5B company. The competitors who fine-tuned on facts
  mostly went under.
- **Hybrid is the realistic answer for vertical AI.** Fine-tune
  the base for style, layer RAG on top for facts.
