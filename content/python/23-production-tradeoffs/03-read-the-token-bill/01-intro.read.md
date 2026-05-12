---
xp: 1
estSeconds: 130
concept: token-math-fundamentals
code: |
  # the chars/4 estimator. real tokenization uses BPE; for english
  # text this approximation is within ~10%. good enough for cost math.
  def estimate_tokens(text):
      return len(text) // 4

  # claude sonnet 4.6 — approximate may 2026 pricing.
  IN_RATE  = 3.0    # $3 per 1,000,000 input tokens
  OUT_RATE = 15.0   # $15 per 1,000,000 output tokens

  prompt = "Summarize the following customer message in one sentence: " \
           "I bought your product two weeks ago and it stopped working yesterday. " \
           "I want a refund or a replacement, whichever is faster."
  answer = "Customer requests a refund or replacement after the product failed two weeks post-purchase."

  in_tokens  = estimate_tokens(prompt)
  out_tokens = estimate_tokens(answer)

  cost_in  = IN_RATE  * in_tokens  / 1_000_000
  cost_out = OUT_RATE * out_tokens / 1_000_000
  total    = cost_in + cost_out

  print(f"input tokens:  {in_tokens}")
  print(f"output tokens: {out_tokens}")
  print(f"input cost:    ${cost_in:.6f}")
  print(f"output cost:   ${cost_out:.6f}")
  print(f"total / call:  ${total:.6f}")
runnable: true
---

# Tokens are the unit. Input and output are priced differently.

If you're shipping anything that calls an LLM, the bill shows up
at the end of the month and the question your CFO will ask is:
*"why did this cost what it cost?"* You need to be able to answer
in one sentence. This lesson is how.

## What a token actually is

A token is roughly **4 characters of english text**, or about
**0.75 words**. The word `tokenization` is one token. The word
`pre-processing` is three. Real tokenizers use BPE (byte-pair
encoding) and the exact count depends on the model, but for cost
math `chars / 4` is within ~10% on english text. That's the
estimator you'll use in the code editor above.

Run the editor. A short customer-support prompt comes out to about
50 input tokens and 25 output tokens. The cost? Roughly
**$0.0005 per call**. Pocket change — until you multiply it.

## The two-sided pricing model

This is the part most people miss the first time they read an
invoice: **input and output tokens have different prices, and
output is always more expensive.** Often 5× more.

Approximate may 2026 pricing (check current rates — these move):

| Model | Input ($/1M) | Output ($/1M) | Ratio |
|---|---|---|---|
| Claude Sonnet 4.6 | $3 | $15 | 5× |
| Claude Opus 4.7 | $5 | $25 | 5× |
| GPT-4 Turbo | $10 | $30 | 3× |
| GPT-4o mini | $0.15 | $0.60 | 4× |

So a "1000-token call" is meaningless until you know the split.
A 1000-in / 100-out call on Sonnet is `$0.003 + $0.0015 = $0.0045`.
A 100-in / 1000-out call on the same model is
`$0.0003 + $0.015 = $0.0153`. **Same total tokens. The second is
3.4× more expensive.**

The rule of thumb: **summarizing is cheap (lots of input, little
output). Generating is expensive (little input, lots of output).**
If your feature asks the model to write a 2000-word blog post from
a 200-word brief, your bill is dominated by output. If your feature
extracts a single yes/no answer from a 5-page document, your bill
is dominated by input.

## Why this matters before you ship

Cursor or Claude Code will happily write you a feature that calls
the model in a loop, generates 2000-token responses per user
message, and runs once per chat turn. That's fine in dev with 3
users. It's $20k/month with 10k DAU. The math is not hard. It just
has to happen *before* the deploy, not after the invoice.

The next 8 steps walk through:

- The four prompt shapes and which one bites you in production.
- How to read a real Anthropic invoice line by line.
- The cost formula you can compute on a napkin.
- The two bugs every junior LLM dev ships at least once.
- A `project_monthly_cost` helper you can drop into any review.

By the end you'll have a four-line python function that turns
"how much will this cost?" from a guess into a number.
