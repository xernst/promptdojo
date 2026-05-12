---
xp: 1
estSeconds: 220
concept: opus-and-thinking-budget
code: |
  # the cost math for a rare-but-important call. Opus 4.7 with
  # an extended-thinking budget vs Sonnet 4.6, on a once-a-quarter
  # contract-review workflow.
  calls_per_year = 12          # one a month
  tokens_per_call = 80_000     # long doc + thinking + reasoned output
  opus_blended  = 15.0 / 1_000_000   # rough blended avg per token
  sonnet_blended = 9.0 / 1_000_000

  opus_yearly   = calls_per_year * tokens_per_call * opus_blended
  sonnet_yearly = calls_per_year * tokens_per_call * sonnet_blended

  print(f"opus yearly:   ${opus_yearly:.2f}")
  print(f"sonnet yearly: ${sonnet_yearly:.2f}")
  print(f"delta:         ${opus_yearly - sonnet_yearly:.2f}")
  print("if Opus catches even one missed contract clause, the delta pays back 100x.")
runnable: true
---

# Opus territory: rare calls that have to be right

Opus 4.7 is the model you use when **the call is rare and the
answer has to be right**. Cost only matters when volume is high.
For a call that runs once a quarter, $5 vs $0.50 is a rounding
error — but the difference between a right answer and a wrong
answer is the entire ballgame.

The shape that says "use Opus":

- **Volume is low.** Once a day, once a week, once a quarter.
  Not "every user message."
- **Stakes are high.** The output will be acted on. A wrong
  answer costs real money or real time to recover.
- **The reasoning is deep.** Multi-document synthesis, novel
  problem-solving, anything where the model needs to think for
  a while before answering.

Three canonical use cases:

1. **Contract review.** Reading a 30-page contract, flagging
   risk clauses, summarizing obligations. Runs once per deal.
   The model that catches the IP-assignment clause the others
   missed earns its bill back 100×.
2. **Architecture review.** "Here's our proposed system design,
   what's going to break in 18 months?" Runs at decision time,
   not in production. Opus's reasoning surface catches second-
   order effects Sonnet glosses over.
3. **Novel research synthesis.** Reading a stack of academic
   papers, identifying the connection nobody else has spotted.
   The cost per call is high; the value of a real insight is
   higher still.

The Opus pattern is what people are gesturing at when they say
"the model as a consultant you fly in." You don't fly in a
consultant to format spreadsheets. You fly them in for the
quarterly strategic review where one good insight pays for the
trip ten times over.

## Extended thinking — the budget you set

Opus pairs especially well with **extended thinking** —
Anthropic's term for giving the model a token budget to "think"
before it answers. You set `thinking={"type": "enabled",
"budget_tokens": 16000}` and the model uses up to 16k tokens of
private reasoning before emitting the visible answer.

You'll see those thinking tokens come back as `thinking` blocks
in `response.content` (the same content list lesson 02 covered).
You don't show them to the user. They're the model's private
scratchpad. They DO cost output tokens, so the budget is a real
knob you tune.

When extended thinking helps:

- Multi-hop logic. The model can lay out the chain of reasoning
  before committing.
- Math and analysis. Working through the calculation visibly
  catches more errors than answering in one shot.
- Adversarial review. "What could go wrong with this plan?" —
  give the model room to think and it'll surface more risks.

When it doesn't:

- Classification, extraction, formatting. The answer is already
  in the input; thinking just burns tokens.
- Anything latency-sensitive. Thinking blocks add seconds (or
  tens of seconds) before the user sees text.

## The cost calculation that flips at scale

The code at the top of this page makes the point concrete. A
contract review run 12× a year on Opus costs roughly $14 a year.
On Sonnet it'd cost $8.60. The delta is $5.76. If Opus catches
even *one* missed clause across those 12 deals, you've paid
back the delta 1000× or more.

Now flip the volume. The same prompt, run 50,000 times a day, is
the difference between $13,500/month on Sonnet and $22,500/month
on Opus. Same model, same task — at high volume, the Opus
premium becomes the entire P&L. **The cost premium of a better
model only matters when call volume is high.**

## The decision rule

A clean three-way rule that captures most situations:

- **High volume + non-critical?** Haiku.
- **High volume + critical, OR moderate volume?** Sonnet.
- **Low volume + high stakes?** Opus.

That's the framework you'll codify in the next steps. The
write step asks you to build `pick_model(task)` from these
rules. The checkpoint adds cost math on top.
