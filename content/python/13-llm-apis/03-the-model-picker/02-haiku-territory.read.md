---
xp: 1
estSeconds: 220
concept: haiku-territory
code: |
  # one of the most common Haiku patterns: per-message moderation.
  # imagine a chat app with 50k messages/day. each one needs a quick
  # toxicity check before it hits the room.

  daily_messages = 50_000
  tokens_per_call = 600       # ~400 input, ~200 output, mostly small
  haiku_blended  = 3.00 / 1_000_000    # rough avg per token
  sonnet_blended = 9.00 / 1_000_000    # rough avg per token

  haiku_daily  = daily_messages * tokens_per_call * haiku_blended
  sonnet_daily = daily_messages * tokens_per_call * sonnet_blended

  print(f"haiku:  ${haiku_daily:>7.2f}/day  -> ${haiku_daily*30:>8.2f}/month")
  print(f"sonnet: ${sonnet_daily:>7.2f}/day  -> ${sonnet_daily*30:>8.2f}/month")
  print(f"ratio:   {sonnet_daily / haiku_daily:.0f}x more on Sonnet")
runnable: true
---

# Haiku territory: high volume, structured, small surface area

Haiku 4.5 is the model you reach for when:

- **The task is well-defined.** Inputs and outputs have a known
  shape. Classification, extraction, routing, simple summary,
  short rewrites, format conversion.
- **The volume is high.** You'll make tens of thousands of calls
  per day (or more). Per-call cost matters more than per-call
  quality at the margin.
- **Latency matters.** Haiku is markedly faster than Sonnet to
  first token, which makes it the right call for anything in a
  user-facing hot path.

The rule of thumb worth memorizing: **Haiku 4.5 hits roughly 90%
of Sonnet's capability at about 3× cheaper on a blended basis**
(same ratio on input and output: $1/$5 vs $3/$15). For tasks
where the last 10% of quality isn't worth 3× the bill, Haiku is
the right call. For tasks where it is, Sonnet is.

## Five tasks that are pure Haiku territory

1. **Classification.** "Is this support ticket about billing,
   technical, or sales?" Three-way pick, schema-constrained
   output, runs on every inbound message. Sonnet wins by 1%; you
   spend 3× to capture it.
2. **Extraction.** "Pull the order number, customer name, and
   amount from this email." Structured output, the model just
   needs to see the fields. Haiku does this all day.
3. **Routing.** "Which of these 12 agents should handle this
   request?" Same shape as classification, runs on every call,
   Haiku.
4. **Formatting.** "Convert this markdown to JSON with these
   keys." Mechanical transformation. Haiku.
5. **Simple summarization.** "Give me a 2-sentence summary of
   this paragraph." Short input, short output, no reasoning
   chain. Haiku.

The code at the top of this page is the per-message moderator
example. 50,000 messages a day at ~600 tokens each. On Haiku
that's about $90/day. On Sonnet that's about $270/day, or $8,100
a month. Same product, 3× the bill. **A feature that's a rounding
error on Haiku eats your margin on Sonnet.**

## The Haiku failure mode worth knowing

Haiku's weak point is **multi-step reasoning that branches**.
The moment your prompt looks like "first do A, then if B happens
do C otherwise do D, but only if E and F together are true,"
Haiku's accuracy drops faster than Sonnet's. The break point is
roughly: 1-2 hops of reasoning, fine. 3+ hops with branching,
upgrade.

The other gotcha: Haiku has a smaller effective context than
Sonnet. Stuffing 100k tokens of prior conversation into Haiku
and asking it to reason over all of it works in the demo and
degrades in production. Long-context reasoning is Sonnet
territory.

## Real numbers from real workloads

A few orders of magnitude worth keeping in your head, for typical
calls (~500 input + ~200 output tokens):

| Task scale | Haiku 4.5 cost | Sonnet 4.6 cost |
|---|---|---|
| 100 calls/day (internal tool) | ~$0.15/day | ~$0.45/day |
| 10k calls/day (small product) | ~$15/day | ~$45/day |
| 1M calls/day (real scale) | ~$1,500/day | ~$4,500/day |

The right way to read this table: at internal-tool scale, model
choice is rounding error. At product scale, model choice is the
difference between a hobby and a margin. At platform scale, model
choice is the entire P&L.

## What to take away

Default to Haiku for anything that looks like classification,
extraction, routing, formatting, or short summarization. Upgrade
to Sonnet when the task requires reasoning, branching, or
long-context understanding. The next step is the inverse: when
Sonnet is the obviously right call.
