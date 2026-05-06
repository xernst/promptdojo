---
xp: 2
estSeconds: 110
concept: judge-bias-taxonomy
code: |
  # the bias hall of fame, named with their measured effect sizes.

  BIASES = {
      "position":         "Judge prefers whichever response appears first.",
      "length":           "Judge prefers longer outputs even when shorter is correct.",
      "self_preference":  "Judge favors outputs from its own model family.",
      "style":            "Judge over-weights confident, well-formatted prose.",
  }

  # source-tagged effect sizes from the literature:
  EFFECT_SIZES = {
      "position":  "GPT-4 flips ~35% of pairs on order swap (Zheng et al. 2023)",
      "length":    "Documented in MT-Bench paper; 'repetitive list attack' wins.",
      "self_pref": "GPT-4 favors GPT-4 outputs; Claude favors Claude (Zheng).",
      "style":     "Effect 0.76-0.92 — bigger than position bias (Park et al. 2024).",
  }

  for name, desc in BIASES.items():
      print(f"{name}: {desc}")
---

# The four biases that make this pattern hard

LLM judges are not neutral graders. They have measurable, named
biases that show up in production every time. The first three were
identified in the 2023 MT-Bench paper that legitimized the pattern.
The fourth has emerged more recently and is, surprisingly, the
biggest.

## Position bias

The judge prefers whichever response is shown first. Zheng et al.
(2023, arxiv.org/abs/2306.05685) measured this directly:

> "GPT-4 consistency on position-swapped pairs jumps from 65.0% to
> 77.5% with few-shot prompting."

That means **35% of close pairs flipped** when you swapped which
output came first. With prompting tricks you can get it down to
~20%. You never get it to zero.

**Mitigation: run both orders.** Run `judge(A, B)` *and* `judge(B,
A)`. Only count cases where the verdict was *consistent* in both
orders. Cases where the judge flipped get scored as `tie` —
because effectively the judge is guessing.

## Length / verbosity bias

The judge prefers longer answers even when shorter would be correct.
The MT-Bench paper demonstrates this with a "repetitive list attack"
— pad a response with redundant bullet points and watch the judge
prefer it. This is why Hamel Husain ranks judges by their resistance
to verbosity attacks: a good judge reads the rubric and cares about
correctness, not word count.

**Mitigation: write the rubric to forbid verbosity.** "Reward
correct, concise answers — penalize redundancy." Judges follow
explicit rubrics surprisingly well; they invent the wrong rubric
when you don't supply one.

## Self-preference bias

The judge favors outputs from its own model family. GPT-4 rates
GPT-4 outputs higher than they deserve; Claude rates Claude outputs
similarly. The G-Eval paper (Liu et al. 2023, arxiv.org/abs/2303.16634)
flagged the same pattern:

> "LLM-based evaluators having a bias towards the LLM-generated
> texts."

Recent work (arxiv.org/abs/2410.21819) confirmed self-preference is
real even when models can't see the source. The bug pattern in
production: you train a system, the same model judges itself, pass
rate looks great. Then you swap to a different judge, pass rate
drops 30+ points.

**Mitigation: use a held-out judge model.** When the system uses
GPT-4o for generation, use Claude or Gemini for the judge. Different
weights, different biases — the *combination* is more honest than
either alone.

## Style bias (the one nobody warned you about)

Judges over-weight confident, well-formatted prose. Park et al.
(2024) measured **effect sizes of 0.76–0.92 for style bias**, vs
≤0.04 for position bias. That's 20× larger. A polished but wrong
answer beats a correct but plain one.

**Mitigation: rubric explicitness, again.** "Score on factual
correctness; ignore tone and formatting." It helps. It doesn't fix
the problem. Style bias is the open research problem in this
pattern, and the production move is to *combine* LLM-as-judge with
mechanical checks (string match, schema validate, citation check)
rather than rely on the judge alone.

## What this means for your code

The biases aren't optional considerations. They're the default
behavior. Steps 4–7 will surface them in code: predict that a judge
picks the long output regardless of order, then build the
both-orders mitigation that catches its own bias and reports `tie`.

Rule of thumb that makes this whole pattern usable: **never trust
a single judge call on a single ordering**. Two calls minimum,
both orders, count only consistent wins.
