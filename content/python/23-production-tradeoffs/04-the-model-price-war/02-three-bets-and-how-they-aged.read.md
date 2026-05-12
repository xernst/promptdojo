---
xp: 1
estSeconds: 220
concept: three-bets-aged
---

# Three bets and how they aged

Theory only sticks if you can see it in actual P&Ls. Three companies,
three different cost-model bets in 2023, three very different outcomes
by 2026.

## Bet 1: Jasper — "GPT-4 unit economics are the unit economics"

Jasper was the marketing-copy company. By 2022 they were doing
~$80M ARR generating ad copy and blog posts on top of OpenAI. In
October 2022 they raised $125M at a $1.5B valuation, the textbook
"AI-native" win.

Their cost model assumed GPT-3.5 and GPT-4 prices were
**permanent floors**. They priced subscriptions around them. They
hired around them. They built features around them.

Then the prices fell, and the floor became a ceiling. Three things
happened in parallel:

1. Their margins on individual API calls became absurd as costs fell —
   for about six months — until competitors realized and undercut on
   price.
2. New entrants (Copy.ai, then a wave of vertical AI writers) shipped
   the same feature on cheaper models and charged $20/month where
   Jasper charged $99.
3. ChatGPT released a free consumer tier, then Anthropic and Google
   followed, then everyone shipped "Write copy with AI" as a feature
   inside the tools the customer already paid for (Notion, HubSpot,
   Mailchimp).

Jasper laid off ~30% of staff in 2023, restructured, and **the path
to IPO that the $1.5B valuation implied has not materialized**. The cost model
they priced against didn't exist twelve months later. They survived as
a smaller company, but they did not capture the upside their cap table
assumed.

**Lesson**: pricing your product against today's model costs is
pricing against a melting ice cube. Anyone who shipped the same
feature at Haiku prices six months later took the customer.

## Bet 2: Perplexity — "route to the cheapest model that meets the bar"

Perplexity launched as an "answer engine" in late 2022. They had a
fundamentally harder cost problem than Jasper: every user query
required (a) a search step, (b) a synthesis call against a frontier
model, (c) a re-ranking pass. Three LLM calls per query, often more
for complex questions, at GPT-4 prices.

If Perplexity had taken the Jasper bet — assume GPT-4 economics
forever — they would have died inside a year.

Instead they built **dynamic model routing** in early 2024. Simple
queries got routed to a smaller, cheaper model (initially Claude Haiku
3, later Sonnet-3.5 once Anthropic released it). Complex queries got
routed to the frontier. They ran their own evals continuously to
re-score which queries needed which tier, and as cheaper models
got better, they kept moving the line.

Their cost-per-query fell **~6× between 2024 and 2026**, faster than
the raw model price curve, because they kept downgrading the routing
tier as cheaper models crossed the quality bar. They survived the
price war by **assuming it would happen** and pricing the product
($20/month Pro) against where the cost curve would be in twelve months,
not where it was today.

**Lesson**: if your product is alive in three years, the model
underneath it has been swapped two or three times. Build the swap in
from the start.

## Bet 3: Cursor — "Haiku-class models are free, use them everywhere"

Cursor (the AI code editor) made the most aggressive bet of the three.
Starting in late 2023, they architected the product around a tiered
model strategy:

- **Frontier model** (Claude Sonnet, then Opus) for the high-stakes
  "compose / refactor / explain this codebase" actions where quality
  matters and the user is waiting on the answer.
- **Cheap model** (Haiku, plus their own fine-tuned tab-complete model)
  for the **invisible** actions — autocomplete predictions, syntax
  fixups, format suggestions, draft summaries — that run hundreds of
  times per session per user.

The frontier calls cost real money. The cheap calls were essentially
free per call but ran at ~100× the volume of the frontier calls. Total
spend was dominated by the cheap tier, but the cheap tier scaled
roughly with the Haiku price curve — which **collapsed** in 2024-2025.

Cursor printed money. The "Tab" autocomplete feature became their
signature, and they could afford to run it constantly because each
call cost a fraction of a cent. By the time the rest of the IDE market
realized, Cursor had a year of compounding usage data, their own
fine-tuned models, and the developer mindshare. They hit ~$300M ARR by
late 2025 with a small team.

**Lesson**: features that were "too expensive to run constantly" in
2023 became free in 2026. Whoever shipped them first owned the
category. The cost curve isn't just a margin question — it unlocks
**new product categories** every twelve months.

## What ties the three together

The three companies had access to the same models, the same APIs, the
same prompt-engineering literature. The only difference was their
**assumption about the price curve**:

- Jasper assumed it was flat. Wrong.
- Perplexity assumed it would fall and built routing. Right.
- Cursor assumed it would fall *and* unlock new product shapes.
  Most right.

The next step is a multiple-choice on this exact pattern, applied to
four hypothetical 2023 startups. Practice spotting which cost-model
assumption survives.
