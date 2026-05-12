---
xp: 1
estSeconds: 200
concept: rag-when-fresh
---

# Fork 1: RAG — when the corpus changes faster than you can retrain

RAG is the right answer when your corpus has a heartbeat. New
documents land daily. Old documents get edited. Records get added.
Tickets get resolved. The truth lives somewhere that is NOT the
model's training data, and it's moving.

Glean is the canonical example. A 2026 enterprise search company at
$200M+ ARR (as of late 2025, growing fast) whose entire moat is "we index your messy enterprise
graph (Slack, Drive, Notion, Linear, Jira, Confluence) and the
model answers from THAT, not from what it learned at training
time." Glean cannot fine-tune. The customer's corpus changes every
hour. Glean cannot stuff the whole thing in context — the average
enterprise has hundreds of millions of documents. RAG is the only
shape that fits.

## Why RAG wins on freshness

The freshness story is simple: a new document hits the index, gets
embedded, and is queryable the moment indexing completes. No
retraining. No model swap. No engineer in the loop. The corpus and
the model are decoupled.

Compare that to fine-tune, where adding a new document means a
training run, eval, deploy, and a rollback plan if quality drops.
Or to long-context, where the new document either fits in the
window (and gets included on every call, even when irrelevant) or
doesn't fit at all.

RAG is the freshness fork. If the answer to "how often does the
corpus change?" is "more than once a week," RAG is almost always
the right starting point.

## The classic case: a support bot reading docs that change weekly

Imagine you ship a SaaS product. Your docs are 300 pages. Your eng
team ships features twice a week, and the docs team updates 5-15
pages per release. Customers ask questions like "how do I configure
SSO for Okta?" and the answer is in section 4.7, which got updated
last Tuesday.

A RAG bot:

- Watches the docs repo. When a markdown file changes, re-chunks
  and re-embeds it.
- At query time, embeds the user question, retrieves the top 5
  chunks, and stuffs them in the prompt.
- Cites the section the answer came from. The customer can click
  through to verify.

The bot is freshness-aligned. The customer asks today's question
and gets today's answer. The docs team's update is live in
minutes.

A fine-tuned bot can't do this. Every doc update needs a training
run. By the time you've fine-tuned, the docs have changed again.

A long-context bot could do it (stuff all 300 pages in the prompt
every call) but at 300K tokens per call, you're paying $0.90 per
question on Sonnet-class models, and your latency is 4-8 seconds
per response. RAG cuts that to $0.02 and 1 second.

## The RAG cost curve

RAG's cost has three components:

1. **Indexing cost.** Pay once per document update. Tiny per-doc
   (a few cents at most) but linear in corpus size.
2. **Retrieval cost.** Pay per query. Embeddings of the query (a
   fraction of a cent) plus a vector search (free if you self-host,
   pennies if you don't).
3. **Generation cost.** Pay per query. The prompt is small — just
   the retrieved chunks (5-20K tokens typically) plus the question.

For Glean's shape (massive corpus, ~10 queries per user per day,
millions of users), this curve is unbeatable. For a 200-page
product manual queried 500 times a day, the curve looks different
— retrieval still wins on freshness but loses on simplicity if the
manual fits in context.

## When RAG breaks down

RAG fails predictably in three shapes:

- **The retrieval misses.** Your chunking shredded the answer
  across two chunks, the top-5 didn't include either, and the
  model hallucinates. This is the failure mode chapter 22 spent
  four lessons fixing — chunking, embeddings, ranking, rerank.
- **The corpus is too small to need it.** If your whole corpus
  fits in 200K tokens (most internal handbooks, most policy
  documents, most onboarding guides), you've built a retrieval
  pipeline for a freshness problem you didn't have. Just put the
  whole thing in the prompt and cache it.
- **The corpus changes so fast that the index lags reality.** A
  trading floor where prices update every 100ms is not a RAG
  problem. It's a real-time inference problem, and you read from
  the live source at query time, not from an index.

Anthropic's contextual retrieval paper (September 2024) is the
production-grade RAG playbook. Anthropic added a step before
chunking where each chunk is prefixed with a contextual summary
("this chunk is from section 4.7 of the SSO configuration docs and
discusses the Okta SAML setup"). The technique reduced retrieval
failures by 35% (embeddings alone), 49% (with BM25), or 67% (with
reranking) on their benchmarks. If you're building serious RAG, you read that
paper and copy the contextual-retrieval step before you touch
anything else.

## What this fork teaches

- **RAG is the freshness fork.** Pick it when the corpus has a
  heartbeat. Don't pick it when the corpus is stable.
- **Glean is the proof point.** Multi-source, ever-changing,
  enterprise-grade. No other fork could have built that company.
- **RAG is not "easier" than the other forks.** Production RAG is
  a 12-month engineering project. The "tutorial RAG" you see on
  YouTube ships in a weekend and breaks at scale.
