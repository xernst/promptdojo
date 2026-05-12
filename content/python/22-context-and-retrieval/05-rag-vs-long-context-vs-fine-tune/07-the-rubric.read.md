---
xp: 1
estSeconds: 200
concept: the-fork-rubric
---

# The rubric — score any product on five axes and the fork usually narrows fast

The case studies above are the intuition. Now the synthesis: a
five-axis rubric you can run on any AI product spec and get a
fork recommendation. This is the rubric the `pick_fork` function
in the next step will encode.

## The five axes (again, with thresholds)

For any product spec, score these five questions:

1. **Freshness pressure.** How often does the corpus change?
   - **Never / yearly**: 0 freshness pressure
   - **Monthly**: low
   - **Weekly or faster**: HIGH freshness pressure — RAG-leaning
2. **Corpus size.** How much text would the model need to see to
   answer any reasonable question?
   - **Under 200K tokens**: fits in context, long-context-eligible
   - **200K-2M tokens**: borderline, depends on cache patterns
   - **Over 2M tokens**: doesn't fit, RAG by physics
3. **Style criticality.** Does the product live or die by HOW the
   model writes?
   - **Generic prose is fine**: low style criticality
   - **Some domain language needed (handled by prompting)**:
     medium
   - **The output must read like an expert in the domain wrote
     it**: HIGH — fine-tune-leaning
4. **Cost budget per call.** What can you afford per query?
   - **Under $0.05/call**: tight — RAG or fine-tune
   - **$0.05-$0.50/call**: comfortable — long-context viable
   - **Over $0.50/call**: rich — any fork works on cost alone
5. **Latency budget.** How fast must the response come back?
   - **Under 1 second**: tight — fine-tune leads, RAG close,
     long-context risky
   - **1-5 seconds**: comfortable — all three viable
   - **Over 5 seconds**: rich — any fork works on latency alone

## How to score

You don't add the axes. You read them as a profile and pick the
fork whose strengths match. Some patterns:

- **High freshness + huge corpus**: RAG, no question. Glean shape.
- **Low freshness + small corpus + bursty queries**: long-context
  with cache. Single-contract review shape.
- **High style criticality + stable output template**: fine-tune.
  Harvey shape.
- **High style + needs current facts**: hybrid (fine-tune + RAG).
  Vertical AI shape.
- **Tight cost + tight latency + small stable corpus**: fine-tune
  if you can amortize training, else RAG.

The decision is rarely close. When you write down the five axes
for a real product, three of them are loud and two are quiet, and
the loud three usually point at one fork.

## Where teams get it wrong

The three failure modes from step 01, mapped to the rubric:

1. **The legal-tech that fine-tuned on facts** had HIGH freshness
   pressure (case law updates constantly) and picked fine-tune,
   whose freshness is the worst of the three. They scored axis 1
   wrong (assumed monthly was fine; it wasn't) and picked the
   fork that punished them for it.
2. **The team that RAG'd a stable 200-page manual** had ZERO
   freshness pressure and SMALL corpus. They should have scored
   axis 1 at zero and axis 2 at "fits in context" and picked
   long-context. They picked RAG because "everyone builds RAG."
3. **The startup that long-contexted a daily-changing customer
   DB** had HIGH freshness AND a tight latency budget. They
   should have picked RAG. They picked long-context because the
   demo was simpler, and the cost curve killed them at scale.

The pattern: teams pick the fork they're familiar with, then bend
the product to fit the fork. The rubric inverts that. Score the
product first; the fork tends to fall out.

## What this rubric doesn't capture

The five axes are useful but not exhaustive. The rubric is a
heuristic, not a decision procedure. It deliberately ignores:

- **Organizational capacity.** Does your team have the ML
  engineering bench to operate a fine-tune pipeline (data
  curation, training infra, eval harness, drift monitoring)? If
  not, fine-tune is more expensive than the axes alone suggest.
- **Regulatory constraints.** Can you legally ship customer data
  through a third-party fine-tune API? Some industries (health,
  finance, EU consumer data) make fine-tune practically
  unavailable regardless of what the rubric says.
- **Product-lifecycle stage.** A pre-PMF startup and a Fortune
  500 mid-rollout get different defaults from the same scores.
  The startup wants the cheapest fastest path to validate the
  idea. The Fortune 500 wants the path that survives audit.
- **The fourth option of "hybrid with a roadmap."** Sometimes the
  right answer is "RAG today, plan to migrate to long-context
  once the corpus stabilizes in six months" — a sequence the
  rubric won't suggest because it scores a single moment in time.

Run the five axes first to narrow the field. Then check these four
considerations before committing. When two of them push hard
against the rubric's recommendation, the recommendation loses.

## When hybrid is the right answer

Hybrid (fine-tune base + RAG augmentation) wins when TWO of the
five axes point in different directions:

- HIGH style criticality (push toward fine-tune) AND
- HIGH freshness pressure (push toward RAG)

This is exactly the vertical-AI shape (Harvey, certain medical AI
products, certain accounting products). The style demand says
fine-tune. The freshness demand says RAG. Hybrid lets both win.

The cost of hybrid is operational complexity: you have a fine-
tuning pipeline AND a retrieval pipeline AND the orchestration
between them. Most teams should NOT pick hybrid until the
single-fork version has shipped and shown a specific failure
mode that hybrid fixes.

## The rubric, in one paragraph

For any AI product, ask: how often does the corpus change, how
big is it, does the model's writing style need to match an
expert, what's the cost budget, what's the latency budget. If the
corpus changes weekly or is over 2M tokens, RAG. If it's stable
and under 2M and queries are bursty, long-context with cache. If
style is the product, fine-tune. If freshness AND style both
matter, hybrid. The five numbers narrow the field fast — then
check the org-capacity, regulatory, lifecycle, and roadmap
considerations before committing.

## What the next two steps do

Step 08 codifies this rubric into a `pick_fork(product_spec)`
function. You write the score-based rules; the function returns
one of `"rag"`, `"long_context"`, `"fine_tune"`, or `"hybrid"`.

Step 09 inverts the rubric: given a product AND a chosen fork,
does the fork fit? `evaluate_strategy(product, fork)` returns
`(ok, reason)`. This is the rubric you'd run on someone else's
pitch deck to decide whether their architecture survives contact
with reality.

By the end you have a rubric you can paste into a planning doc
and a function that codifies it. That's worth more than any
specific RAG library you'll learn.
