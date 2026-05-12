---
xp: 1
estSeconds: 200
concept: long-context-when-fits
---

# Fork 2: Long-context — when the whole corpus fits and stays put

The big shift in 2024-2026 was context windows getting genuinely
large. Gemini 1.5 Pro shipped a 1M-token context window in February
2024. Gemini 1.5 Pro went to 2M in 2024; Gemini 2.0 Pro shipped with
2M in early 2025. Anthropic's Sonnet 4.6 sits at 1M. GPT-5.5 ships
with 1M.

This changed the calculus for a specific shape of product:
**stable corpus, small enough to fit, queried many times per
session**. Before long context, those products were RAG by default
because nothing else fit. After long context, they're often
better-served by just stuffing the whole thing in the prompt and
letting prompt caching make it cheap.

## The "just shove it all in there" pattern

The pattern is exactly what it sounds like:

- Load the entire corpus into the system prompt at session start.
- Use prompt caching so the corpus is processed once and cached.
- Run as many queries against the cached prompt as the session needs.

When it works, the per-query cost approaches the cost of just the
question + the answer. The corpus, having been processed once and
cached, is effectively free on the second through Nth query.

Anthropic's prompt cache is the key infra here. Two important
numbers to know:

- **Cache TTL: 5 minutes (default).** A cached prompt stays warm for
  5 minutes after its last use. The default was previously 1 hour
  but Anthropic shortened it in early 2026 to reduce stale-cache
  problems and tighten infra costs. The 1h option is still available
  as an explicit opt-in (`"cache_control": {"type": "ephemeral", "ttl": "1h"}`)
  at 2× input write cost — the change was to the default, not the
  option. The 5-minute default still broke a lot of long-context
  architectures that silently assumed 1-hour lifetimes.
- **Cache read cost: ~10% of base input cost.** When the cache
  hits, you pay roughly a tenth of what you'd pay to send those
  tokens fresh. This is what makes the pattern economical.

The 5-minute TTL is the single most important number for designing
long-context products. If your queries are bursty within a 5-min
window (a user asking 10 questions about a contract in one
sitting), the pattern is incredibly cheap. If queries are spread
across hours, cache misses dominate and the cost explodes.

## The classic case: a legal-review bot loading the whole contract once

A legal-tech startup builds a bot that reviews commercial contracts.
The user uploads a contract (200K-500K tokens), then asks a series
of questions:

- "What's the termination clause?"
- "Are there any indemnification terms I should flag?"
- "Compare the liability cap to industry standard for SaaS deals."
- "Pull out every renewal-related clause."

Old shape (pre-long-context): chunk the contract, embed it, run a
RAG pipeline on each question. This works, but you lose context
across chunks. Asking about "renewal terms" might miss a clause
buried in a definitions section that the chunker put in a
different bucket.

New shape (long-context): load the whole contract into a cached
system prompt. Every question hits the full document. The model
sees the whole thing on every query. Cross-document reasoning ("the
indemnification cap in section 7 conflicts with the warranty in
section 12") becomes possible because both sections are in context.

Per-query cost on Sonnet 4.6 with cache hits: roughly $0.05-0.15
for a 300K-token contract being queried in a 5-min window. The
same workload via RAG would have been $0.02-0.05 per query — RAG
is still cheaper per call, but it can't answer the cross-document
questions, and the architecture is 10× simpler.

## When long-context wins

The dominance conditions for long-context:

- **Corpus is stable for the session.** Once loaded, it doesn't
  change. Legal contracts, codebases-at-a-commit, single onboarding
  manuals, single research papers.
- **Corpus fits in the window.** Modern windows are 1-2M tokens.
  Anything bigger needs RAG by physics.
- **Query patterns are bursty.** Multiple queries within the 5-min
  cache TTL. A user doing a deep review session, not a customer
  asking one question and leaving.
- **You need cross-corpus reasoning.** The model needs to see the
  whole document to answer the question. RAG fragments this.

When all four conditions hit, long-context dominates RAG on both
quality and architectural simplicity. The infra is "an API call."
There is no vector store. There is no chunker. There is no
embedding pipeline. There is no rerank step.

## When long-context breaks

Long-context fails predictably:

- **Corpus too big.** A 10M-token enterprise wiki doesn't fit, so
  you're back to RAG by physics. Most enterprise products live
  here.
- **Cache misses dominate.** If queries are spread over hours, the
  5-min TTL means most queries pay full freight. The cost explodes
  fast — a 500K-token prompt at full price is $1.50-3.00 per query
  on Sonnet-class models.
- **The corpus changes mid-session.** Every change invalidates the
  cache, forcing a full re-process on the next query.
- **The "needle in a haystack" failure.** Empirically, even large-
  context models lose track of specific facts when the prompt is
  near the limit. Gemini's own evals show retrieval accuracy
  degrading past 500K tokens. The model has the data, but doesn't
  reliably find it.

Jason Liu's December 2024 "RAG is dead" thread on X was about long-
context's encroachment on RAG's territory. The thread was correct
about the trend (long-context took the small-corpus stable-doc use
case) and wrong about the framing (RAG isn't dead, it just shrank
to the freshness-and-huge-corpus territory it was always best at).

## What this fork teaches

- **Long-context is the simplicity fork.** When it fits, the infra
  is one API call. No vector store, no chunker, no rerank.
- **The 5-minute cache TTL is the make-or-break number.** Design
  for bursty queries within the window or pay full freight.
- **2M tokens isn't infinite.** Most enterprise corpora still need
  RAG. Long-context took the small-corpus territory. RAG kept the
  big-corpus territory.
