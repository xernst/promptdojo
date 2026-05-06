---
xp: 2
estSeconds: 95
concept: cot-on-reasoning-models
code: |
  # the same task. two prompt strategies. which one fits which model?

  REASONING_MODELS = {"o1", "o3", "o4-mini", "claude-sonnet-4-6-thinking", "gemini-2.5-thinking"}

  def build_prompt(model_name, task):
      is_reasoning = model_name in REASONING_MODELS
      if is_reasoning:
          # let the model do its own reasoning. just state the task.
          return task
      else:
          # explicit CoT helps non-reasoning models.
          return f"{task}\n\nThink step by step before answering."

  task = "Is 17 a prime number?"
  for model in ["claude-sonnet-4-6", "o3", "gpt-4o", "o1"]:
      prompt = build_prompt(model, task)
      cot_added = "step by step" in prompt
      print(f"{model}: cot_added={cot_added}")
---

# Don't add CoT to a model that's already reasoning

The 2023 prompt-engineering folklore: "always add 'think step by
step' — it improves reasoning." That was true on GPT-4 and Claude
3, the models everyone benchmarked CoT against.

The 2026 reality: that advice is now wrong on a growing class of
models. **Reasoning models** — OpenAI's o-series, Claude with
extended thinking, Gemini 2.5+, DeepSeek R1 — do their reasoning
internally. They emit a separate `thinking` block (which you can
read but the user doesn't see) that contains the full
chain-of-thought. The visible answer is the conclusion, not the
reasoning.

Adding "think step by step" to a reasoning-model prompt:

1. **Adds output tokens** — the model now writes its reasoning
   twice (once internally, once in the visible answer).
2. **Doesn't improve accuracy** — Wharton's *Decreasing Value of
   Chain-of-Thought* (gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/)
   measured this directly.
3. **Sometimes hurts** — explicit external CoT can interfere with
   the model's internal reasoning trace, lowering answer quality
   on benchmarks that compare to no-CoT baselines.

OpenAI's [reasoning models guide](https://openai.com/index/reasoning-models-chain-of-thought-controllability/)
explicitly warns:

> "Encouraging the model to produce a chain of thought before
> answering — for example by adding 'think step by step' to the
> prompt — could affect the model's reasoning process in
> unintended ways."

## The decision rule

```
if model is reasoning-class:
    skip CoT — the model handles it internally
else:
    add CoT for complex multi-step tasks
```

What "complex multi-step" means: tasks that benefit from
intermediate steps before the final answer (math, logical
deduction, multi-stage planning). For simple lookups or
classifications, even non-reasoning models don't benefit.

## How to tell which is which

| Family | Reasoning? | CoT in prompt? |
|---|---|---|
| OpenAI o-series (o1, o3, o4-mini) | Yes | **Skip** |
| OpenAI GPT-4o, GPT-4-turbo | No | Add for complex tasks |
| OpenAI GPT-5 (when reasoning enabled) | Yes | **Skip** |
| Claude Sonnet 4.6 (without thinking) | No | Add for complex tasks |
| Claude Sonnet 4.6 with `thinking` enabled | Yes | **Skip** |
| Claude Haiku 4.5 | No | Add for complex tasks |
| Gemini 2.5 Pro/Flash with thinking | Yes | **Skip** |
| Gemini 1.5 / 2.0 Flash | No | Add for complex tasks |

The control surface for Claude is the `thinking` parameter on
`messages.create`. When it's set, the model is in
reasoning-class mode; when it isn't, it's standard.

## Few-shot is different

Note: this trap is specific to CoT. **Few-shot examples still
help on reasoning models** — they teach format, labels, and tone
the same way, regardless of reasoning capability. So:

- Reasoning model + few-shot: GOOD
- Reasoning model + "think step by step": BAD
- Non-reasoning model + few-shot: GOOD
- Non-reasoning model + "think step by step" for complex tasks:
  GOOD

The two techniques aren't interchangeable, and the rule for each
is different.

## Why this matters now (2026)

A year ago you could write a single prompt-engineering
playbook and deploy it everywhere. Now you can't. The same
prompt that improved Sonnet's math accuracy will hurt o3's
math accuracy. Every prompt template needs to know what model
class it's targeting.

Step 6 fixes the bug of bolting CoT onto a reasoning-model
prompt. Step 7 fixes the more common few-shot bug — examples
in a different format than the actual query.
