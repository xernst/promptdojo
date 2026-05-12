---
xp: 1
estSeconds: 200
concept: the-three-way-fork
---

# The decision that's killed more AI startups than any model swap

This lesson is a theory lesson. There is barely any code. That is on
purpose. The previous four lessons of this chapter taught you how to
build RAG — chunking, embeddings, retrieval, ranking. This lesson
zooms out and asks a different question: **should you be building
RAG at all?**

Because every team building an AI product right now is, knowingly or
not, picking one of three forks. The fork they pick determines their
cost curve, their freshness story, their latency budget, and whether
they're still in business in 18 months. The fork is invisible in the
demo. It shows up at scale.

## The three forks

There are three ways to get knowledge into a language model at
inference time. Exactly three. Every product is some combination of
these, but the architecture pivots on one:

1. **Pull-from-source (RAG)**. Keep the knowledge in a vector store
   (or a SQL table, or a search index). At query time, retrieve the
   relevant chunks and stuff them into the prompt. The model never
   sees the corpus during training. It just sees today's slice.
2. **Stuff-the-context (long-context)**. Put the entire corpus in
   the prompt. Gemini's 2M-token context window made this a real
   option for whole-codebase and whole-contract use cases. With
   prompt caching, the marginal cost per query collapses.
3. **Bake-into-the-model (fine-tune)**. Train the model on your
   corpus so the knowledge lives in the weights. The model doesn't
   need to be told anything at inference time — it already "knows."
   Style, format, and domain language all transfer.

These look like alternatives. They're really tradeoffs along five
axes, and the right answer is almost always "use the fork whose
tradeoffs match the product."

## The five tradeoff axes

Every product evaluation reduces to these five questions:

1. **Freshness.** How often does the corpus change? Hourly?
   Quarterly? Never? RAG dominates when freshness is hours-to-days.
   Long-context dominates when the corpus is stable for the session.
   Fine-tune is hopeless when freshness matters at all — the
   knowledge in the weights is frozen at training time.
2. **Governance.** Can you point at the specific source the model
   used? RAG gives you citations for free (you know which chunks
   went in). Long-context gives you the whole document as the
   citation. Fine-tune gives you nothing — the model can't tell
   you which training example produced an output.
3. **Cost per call.** RAG's cost is retrieval + a small prompt.
   Long-context's cost is the full prompt every call, unless the
   prompt cache hits. Fine-tune's cost is a small inference call,
   but the training cost amortizes only if you call the model a lot.
4. **Latency budget.** RAG adds a retrieval hop (50-500ms). Long-
   context adds prompt-processing time (linear in token count, but
   cached on Anthropic's models if you're careful). Fine-tune is
   the lowest-latency option per call.
5. **Capability gap.** Is the model bad at your domain language,
   your formatting conventions, your house style? RAG can't fix
   that — it can only give the model the right facts. Fine-tune is
   the only fork that fixes capability gaps in the model itself.

## Why the wrong fork kills startups

The graveyard is full of teams that picked the wrong fork. A few
shapes of failure that keep repeating:

- **Fine-tuned on facts.** The legal-tech that fine-tuned GPT-4 on
  case law in 2024 got crushed when GPT-5.5 with a 1M context window
  shipped in 2026. The fine-tune was a freshness liability — every
  new case meant retraining. Long-context (or RAG) would have aged
  better.
- **RAG'd a stable corpus.** A company built a retrieval pipeline
  for a 200-page product manual that hasn't changed in three years.
  Six engineers, twelve months, a vector store. The whole manual
  fits in a 200K-token context window and would cost less per query
  with prompt caching. They built infra for a freshness problem
  they didn't have.
- **Long-contexted a hot corpus.** A startup tried to keep a daily-
  updating customer database in the prompt. Cache misses on every
  update, cost went vertical, latency tanked. Should have been RAG.

Jason Liu's "RAG is dead" thread on X (December 2024) was provocative
because it pointed at one real failure mode (overbuilt RAG when
long-context would do) and got read as "stop using RAG at all." It's
neither. It's: **pick the fork that matches the corpus**.

## What this lesson is

The next five reading steps walk through each fork with named
examples, then synthesize a five-axis rubric you can apply to any
product. The two MC steps test whether you can pick the right fork
for a scenario. The write and checkpoint steps codify the rubric
into a `pick_fork(product_spec)` function you can paste into your
own planning docs.

By the end you should be able to read any AI product launch and
predict which fork they picked, and whether the picked fork matches
the corpus shape. That intuition is worth more than any specific
RAG library you'll learn.
