---
xp: 2
estSeconds: 110
concept: reading-an-anthropic-invoice
code: |
  # a stylized monthly invoice — three line items.
  # cache reads bill at 0.1x input rate; cache writes bill at 1.25x.

  IN_RATE      = 3.0
  OUT_RATE     = 15.0
  CACHE_READ_X = 0.1
  CACHE_WRITE_X = 1.25

  line_items = [
      # (label, units (tokens), rate $/1M)
      ("Input tokens (uncached)",  12_400_000, IN_RATE),
      ("Output tokens",             3_100_000, OUT_RATE),
      ("Cache read tokens",        48_000_000, IN_RATE * CACHE_READ_X),
      ("Cache write tokens",        2_400_000, IN_RATE * CACHE_WRITE_X),
  ]

  total = 0.0
  print(f"{'line item':<28} {'tokens':>14} {'rate $/1M':>10} {'subtotal':>10}")
  print("-" * 66)
  for label, tokens, rate in line_items:
      subtotal = tokens * rate / 1_000_000
      total += subtotal
      print(f"{label:<28} {tokens:>14,} {rate:>10.3f} {subtotal:>10.2f}")
  print("-" * 66)
  print(f"{'TOTAL':<54} ${total:>9.2f}")
runnable: true
---

# Every invoice has the same four rows

Pull up your last Anthropic or OpenAI invoice. Doesn't matter
which month, doesn't matter which provider — the line items are
always some flavor of these four:

1. **Input tokens (uncached)** — everything you sent the model
   that wasn't already in the cache. Billed at the input rate.
2. **Output tokens** — everything the model generated. Billed at
   the output rate (3–5× higher than input).
3. **Cache read tokens** — input tokens served from the prompt
   cache. Billed at **0.1× the input rate** on Anthropic. The
   single biggest line item to optimize.
4. **Cache write tokens** — input tokens written into the cache.
   Billed at **1.25× the input rate** for 5-minute TTL, **2×** for
   1-hour TTL. The cost of priming the cache.

Run the editor. The invoice shows a real-shaped month for a small
agent workload. **Total: about $107.** Look at the lines:

- Cache reads dominate token *count* (48M tokens) but barely move
  the cost — they're billed at $0.30/1M instead of $3/1M.
- Output is only 3.1M tokens — a fraction of input — but it's the
  second-largest line because the output rate is 5× higher.
- Cache writes are tiny in volume but cost more per token than
  regular input. They show up small here because you write once
  and read many times.

## How to do the math in your head

The formula for any line:

```python
subtotal = tokens * rate_per_million / 1_000_000
```

Or equivalently: **tokens divided by 1,000,000, times the rate.**
If you have 12.4M input tokens at $3/1M, that's `12.4 × $3 = $37.20`.
If you have 3.1M output tokens at $15/1M, that's `3.1 × $15 = $46.50`.

The cognitive shortcut: **divide your monthly token volume by a
million, then multiply by the per-million rate.** No spreadsheet
needed. You can sanity-check an invoice in 30 seconds.

## What junior engineers miss

Two patterns cause "surprise" bills:

- **Mixing up the rate units.** Anthropic quotes prices as "$3 per
  1M tokens" — that's *per million*, not per thousand. Off by 1000×
  in the wrong direction turns a $400 month into a $400,000 alert.
  Step 7 is the bug that ships when someone divides by 1000 instead
  of 1,000,000.
- **Pricing both input and output at the input rate.** Forgetting
  that output is 5× more expensive understates the bill by about
  60% on a typical chat workload. Step 6 is the bug.

## What this means for your forecast

If you can compute the four line items, you can predict the bill
before you ship. The shape:

```
monthly_cost ≈ daily_calls × cost_per_call × 30
```

Where `cost_per_call` is the formula from step 5. That's the whole
game. The next step has you forecast a month given a known
cost-per-call and a known DAU.
