---
xp: 1
estSeconds: 220
concept: pricing-rules-for-volatile-costs
---

# Pricing for a war you can't predict

If the model price will be a different number twelve months from now,
and you can't accurately guess which model you'll be using, **how do
you actually price the feature today?**

There are three rules that the survivors of the 2023-2026 price war
have in common. Each is boring on its own. Together they are the
difference between a product that compounds and one that gets
strip-mined by a cheaper entrant.

## Rule 1: never let model cost exceed 10% of unit revenue

If a user pays you $20/month, the API calls under that user's account
should cost you no more than $2/month. Probably less. The reason isn't
margin theory — it's **headroom for the price war you can't predict**.

Three things will happen on a rolling basis and you cannot prevent them:

- A user will get more active than your average and triple their call
  volume. Your cost goes up 3×.
- A competitor will ship a free version of the same feature and put
  pricing pressure on you. Your revenue per user gets squeezed.
- You will add features that increase call volume per user, because
  product expansion is how you keep users from churning.

If model cost is already at 30% of revenue, any of those events
breaks your unit economics. If it's at 5-10%, you have headroom to
absorb all three. The rule sounds conservative. It is. It's the only
rule that survives.

This is why per-message moderation didn't ship in 2023 — at GPT-4
prices it was 50%+ of subscription revenue. It only became viable
when Haiku-class prices dropped the cost below the 10% line.

## Rule 2: always have a downgrade path

Every feature you ship should run on **two named models**: a primary
and a fallback one tier cheaper. If your primary is Sonnet, the
fallback is Haiku. If your primary is Opus, the fallback is Sonnet.

The downgrade path matters for three reasons:

1. **Capacity outages**. The frontier model goes down for an hour
   once a quarter. If your feature can't fall back to the cheaper
   tier, your feature goes down. Cheap tier never goes down.
2. **Cost spikes**. When the next price-shock release happens (a new
   capability tier ships at the existing price), you want to be the
   product that can route to it within a sprint. Routing
   infrastructure has to exist already.
3. **Quality re-evaluation**. Twelve months from now, the cheaper
   tier will be as good as today's primary on 80% of your queries.
   You want to be able to flip the routing line **the day** that
   becomes true, not six months later.

In code terms, this means **never hardcode a model name in your
feature path**. Always read it from a config layer that knows about
the primary model, the fallback model, and the routing rule between
them. (You'll write a tiny version of this in the next step.)

## Rule 3: price the feature, not the model

The single biggest pricing mistake in 2023-2024 was this: "GPT-4
costs us $X per call, so the user pays $X × N margin." Pricing
*against the cost basis* locks you into the cost curve. When the
curve moves, your pricing has to move with it, and every customer
contract has to be renegotiated.

The right move is to **price the outcome the user is buying**.
"Cleaning up 10,000 customer support tickets per month" is worth
something to the buyer regardless of which model does the work. Price
that. As the model cost falls underneath, your margin expands and
you reinvest it into product expansion — not into a price cut that
re-anchors the customer to "the model fee."

The companies that got this right in 2024-2026 (Perplexity at
$20/month, Cursor at $20/month, Glean and Harvey at enterprise tiers
priced per-seat) **never told the customer about the model**. The
model was an implementation detail. The customer paid for the
outcome. When the model swapped underneath, the price didn't move.
When the price didn't move, the cost-curve collapse showed up as
pure margin.

## One more lever: prompt caching

Already covered in the last lesson, but worth restating in the context
of price-war pricing. **Prompt caching is the second-biggest cost
lever in 2026**, after model choice. A static system prompt that gets
re-sent on every call can cache at 90% of the input price. On a
high-volume feature, that's another 4-5× cost reduction *on top of*
whatever model swap you do.

A caveat the rest of this lesson assumes you'll remember: prompt
caching's parameters move under you. Anthropic changed the default
cache TTL from 1 hour to 5 minutes in early 2026 — see the ch22
lesson on long-context — which broke a lot of long-context
architectures overnight. Caching is a cost lever, not a permanent
moat. Design as if the discount could halve in 12 months, and keep
your cost model parameterized so you can re-run unit economics in an
afternoon when the provider changes the rules.

If you stack the levers — model choice (10×), caching (4×), output
budget (2×) — the same feature can be **80× cheaper** in 2026 than
it was for a 2023 implementation. That's not optimization; that's a
different product. Whoever does the stacking owns the category — for
as long as the multipliers hold.

## What's next

Two build steps. First you'll write the cost model itself —
`cost_per_user_month(usage)` — so you can see your own feature's
unit economics in code. Then in the checkpoint, you'll write
`pick_model(constraint)` that picks the cheapest model meeting a
quality floor under a budget cap. That's the routing logic that
Perplexity and Cursor built into their products from day one.
