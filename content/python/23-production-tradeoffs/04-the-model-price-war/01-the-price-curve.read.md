---
xp: 1
estSeconds: 220
concept: model-price-curve
---

# Two orders of magnitude in three years

GPT-4 launched in March 2023 at **$30 per million input tokens and $60
per million output tokens**. That price was the assumption every
serious LLM company built their unit economics on for the next twelve
months. Funding rounds got raised against it. Pricing pages got
written against it. Headcount got hired against it.

By May 2026, the frontier looks like this:

- **Claude Haiku 4.5** — $1 input / $5 output per 1M tokens
- **Claude Sonnet 4.6** — ~$3 input / $15 output per 1M tokens
- **Claude Opus 4.7** — $5 input / $25 output per 1M tokens
- GPT and Gemini frontier tiers track within a small multiple of these

Read those numbers carefully. **Haiku 4.5 input is 30× cheaper than
GPT-4 input three years earlier.** Sonnet 4.6, which is a genuinely
better reasoner than the original GPT-4, is **10× cheaper on input and
4× cheaper on output**. The "expensive" tier in 2026 (Opus) is the
same price as the cheap tier in 2024.

This is not a one-time drop. It's a power-law collapse.

## What the curve actually looks like

A16z's LLM pricing tracker (the canonical chart in the industry,
updated quarterly) shows the per-token cost of "GPT-4-class
intelligence" falling roughly **10× every twelve months** since the
original release. Dylan Patel's SemiAnalysis breakdowns of the
inference economics give you the why: smaller-better models, better
serving infrastructure, FP8/FP4 quantization, speculative decoding,
and a brutal multi-lab competition for developer mindshare.

The shape of it:

```
GPT-4 launch (Mar 2023):     $30 / $60 per 1M  ← baseline
GPT-4 Turbo (Nov 2023):      $10 / $30         ← 3x cheaper input
Claude 3 Sonnet (Mar 2024):  $3  / $15         ← 10x cheaper input
GPT-4o (May 2024):           $5  / $15
Claude 3.5 Sonnet (Jun 2024):$3  / $15
Haiku 3.5 (Oct 2024):        $1  / $5          ← cheap-tier emerges
Sonnet 4.5 (mid 2025):       $3  / $15
Haiku 4.5 (Oct 2025):        $1   / $5        ← 30x cheaper input
Sonnet 4.6 (early 2026):     $3   / $15
Opus 4.7 (April 2026):       $5   / $25
```

The frontier label sits at roughly the same price point each year
($3/$15 for "best general workhorse"), because the labs keep
relabeling. But the **capability that used to live at $3/$15 keeps
sliding down to $1/$5 within twelve months**. Yesterday's
flagship becomes today's cheap tier.

## Why this matters more than the model itself

If you built a product in 2023 with GPT-4 cost assumptions baked in,
**you over-paid by 99% for three years**. If you build a product in
2026 with Sonnet 4.6 cost assumptions baked in, you will probably
overpay by 90% by 2027.

The strategically interesting question is not "what does my feature
cost today?" It is "**what does my feature cost when the model I'm
using is one-tenth the price in twelve months?**" Features that are
unaffordable at Sonnet prices but viable at Haiku-4.5 prices are
features your competitors will ship in 2027 even if you can't ship
them today.

Three implications worth burning into your head before the next step:

1. **The unit economics of any LLM feature are dated within twelve
   months.** You are not pricing against today's model. You are
   pricing against the model that will exist when the contract
   renews.
2. **The biggest lever is "which model" — not prompt engineering.**
   Switching from Opus to Sonnet is a ~1.7× cost reduction. Switching
   from Sonnet to Haiku is another 3× reduction. No amount of prompt
   trimming touches that.
3. **The companies that won the last three years were not the ones
   with the best 2023 product. They were the ones who restructured
   their cost model fastest as prices fell.** The next two case
   studies show this in detail.
