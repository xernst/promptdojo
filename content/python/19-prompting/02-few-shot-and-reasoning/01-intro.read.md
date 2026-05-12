---
xp: 1
estSeconds: 110
concept: few-shot-and-reasoning-models
code: |
  # two prompting techniques that almost everyone misuses.
  # the rule: pick the right tool for the model class.

  EXAMPLES = [
      {"input": "great product, fast shipping", "output": "positive"},
      {"input": "broke after a week", "output": "negative"},
      {"input": "it's okay, nothing special", "output": "neutral"},
  ]

  def build_few_shot_prompt(task, examples, query):
      example_text = "\n".join(f"Input: {e['input']}\nOutput: {e['output']}\n" for e in examples)
      return f"{task}\n\n{example_text}\nInput: {query}\nOutput:"

  prompt = build_few_shot_prompt(
      task="Classify the sentiment as positive, negative, or neutral.",
      examples=EXAMPLES,
      query="late but quality was fine",
  )
  print(prompt)
runnable: true
---

# Two techniques. One has aged well. The other has aged badly.

Lesson 01 set up the six-knob prompt scaffold (role, task, context,
format, examples, constraints). This lesson is about two of the
most-cited prompting techniques: **few-shot examples** and
**chain-of-thought (CoT)**. They were both gospel in 2023. By 2026,
one is still gospel; the other has become a trap.

## Few-shot — still works, when used right

Few-shot prompting is putting 2–5 example input/output pairs in
the prompt before the real query:

```
Classify the sentiment as positive, negative, or neutral.

Input: great product, fast shipping
Output: positive

Input: broke after a week
Output: negative

Input: late but quality was fine
Output: ?
```

The model sees the pattern and follows it. Three places this
genuinely earns its keep:

1. **Format lock-in.** When you need the output in a specific
   shape (label only, JSON, fixed prefix), examples teach the
   shape better than instructions can describe it.
2. **Domain disambiguation.** "Classify support tickets" means a
   different thing in different products. Examples ground the
   classifier in *your* labels, not the model's prior.
3. **Output style.** Tone, formality, brand voice — show, don't
   tell. Even three examples set tone better than a paragraph.

It also has failure modes — covered in steps 6 and 7 — most
notably *format lock-in working too well* (model rigidly mimics
example format even when the user's actual query needs different
formatting).

## CoT — the trap on reasoning models

Chain-of-thought prompting (adding "think step by step" or
"explain your reasoning before answering") was the single
highest-leverage technique on GPT-4 and Claude 3 in 2023–2024. On
modern reasoning models (OpenAI's o-series, Claude with extended
thinking, Gemini 2.5+), it's at best redundant and at worst
*harmful*.

Why: reasoning models do step-by-step reasoning *internally* —
that's the whole feature. Asking them to "think step by step" out
loud:

- Adds output tokens (and cost).
- Doesn't improve accuracy on most benchmarks.
- Sometimes hurts — explicit CoT in the prompt can interfere with
  the model's internal reasoning trace, *lowering* answer quality.

Cited evidence:
- Wharton's *Decreasing Value of Chain-of-Thought* (2024) —
  measured CoT no longer improving and sometimes hurting on newer
  models.
- OpenAI's [reasoning models guide](https://openai.com/index/reasoning-models-chain-of-thought-controllability/)
  warns against bolting external CoT onto o-series models.

**The 2026 rule**: CoT helps non-reasoning models (Sonnet,
GPT-4o, Haiku). It doesn't help reasoning models (o-series, Claude
with extended thinking, Gemini 2.5+). Always ask: which model
class am I prompting?

## What everyone calls these techniques

| Technique | Names you'll see |
|---|---|
| **Few-shot** | "in-context learning," "in-prompt examples," "k-shot" (k=2,3,5...) |
| **Chain-of-thought** | "CoT," "step-by-step," "scratchpad," "reasoning prefix" |
| **Reasoning models** | OpenAI o-series (o1, o3, o4), Claude with extended thinking, Gemini 2.5 Thinking, DeepSeek R1 |
| **Non-reasoning models** | "Standard models" — Sonnet without extended thinking, GPT-4o, Haiku |

## What you'll build

A `build_few_shot_prompt(task, examples, query)` that assembles
the canonical example-driven prompt format. Then the bug step 6
fixes: bolting "think step by step" onto a reasoning-model prompt
(redundant at best, harmful at worst). Then the bug step 7 fixes:
example format mismatching the actual query format (the model
locks in on the wrong template).
