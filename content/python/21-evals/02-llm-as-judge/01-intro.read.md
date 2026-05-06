---
xp: 1
estSeconds: 120
concept: llm-as-judge-pattern
code: |
  # the judge is just a model with a critique prompt and a binary verdict.

  def judge(question, answer, rubric):
      # in real code: a model call constrained to {"passed": bool, "critique": str}.
      # here: a deterministic mock that returns canned verdicts.
      if "Paris" in answer and len(answer) < 50:
          return {"passed": True,  "critique": "Concise and correct."}
      if "Paris" in answer:
          return {"passed": True,  "critique": "Correct but verbose."}
      return {"passed": False, "critique": "Did not name Paris."}

  cases = [
      ("What's the capital of France?", "Paris."),
      ("What's the capital of France?", "Paris is the capital, located in northern France."),
      ("What's the capital of France?", "I think maybe Lyon?"),
  ]
  for q, a in cases:
      v = judge(q, a, "Reward correct, concise answers.")
      print(f"{a!r}: pass={v['passed']} — {v['critique']}")
runnable: true
---

# When `assert` runs out of road, send in another model

Lesson 01 ranked four eval patterns by strictness: exact match,
contains, shape, judge. The first three are mechanical — string
compare, regex, schema validate. The fourth is *another model*
reading your model's output and grading it. That's LLM-as-judge.

You reach for it when the answer is correct in many forms ("explain
photosynthesis to a 5-year-old," "translate this email," "draft a
support reply") and string equality is useless. The 2023 paper that
made this respectable, *Judging LLM-as-a-Judge with MT-Bench and
Chatbot Arena* (Zheng et al., NeurIPS 2023, arxiv.org/abs/2306.05685),
showed that GPT-4-as-judge agreed with human raters on **over 80%**
of comparisons — the same level humans agree with each other. That's
the green light the field needed.

It's also the pattern that ships the most subtle bugs.

## Two shapes you'll see in the wild

| Shape | Question asked | Output |
|---|---|---|
| **Pairwise** | "Given outputs A and B, which is better?" | `A` / `B` / `tie` |
| **Rubric** | "Score this output against this rubric." | `pass` / `fail` (+ critique) |

Pairwise is what Chatbot Arena uses. Cheap relatively (you're not
generating a number, just a vote), more consistent than absolute
ratings — humans are better at "this one over that one" than "is
this a 7 or an 8." Cost: O(n²) comparisons, no absolute quality
floor.

Rubric is what you want for CI and regression evals. One number per
case, plug into pytest, fail the build if the rate drops. Hamel
Husain's blunt rule from his eval methodology guide: **use binary
pass/fail, not 1–5 Likert**. Likert scores drift, the difference
between a 3 and a 4 is undefined, and averaging them produces false
precision. Binary forces you to write the rubric until it's
unambiguous. (hamel.dev/blog/posts/llm-judge/)

## What everyone calls it

| Framework | Primitive |
|---|---|
| **LangSmith** | `evaluators` — `LLMEvaluator`, custom rubric configs |
| **OpenAI Evals** | `graders` — `score_model` / `label_model` |
| **Inspect AI** (UK AISI) | `scorers` — `model_graded_qa()`, `model_graded_fact()` |
| **Promptfoo** | `assert: llm-rubric`, `assert: factuality` |
| **DeepEval** | `GEval` (Liu et al. *G-Eval* paper, arxiv.org/abs/2303.16634) |
| **Anthropic SDK** | No native primitive — use `tools=[...]` to force structured verdict (the "tool-use trick") |

Same primitive everywhere: send the input + output + rubric, get a
structured verdict back. You'll write the framework-free version in
step 8.

## The trap that defines this lesson

LLM-as-judge has four documented biases — position, length,
self-preference, style. They're not edge cases; they're the default.
A judge will pick the *first* output you show it more often than
chance. It will pick the *longer* output regardless of whether
length matters. It will rate outputs from its own model family
higher. Step 3 names them with citations and step 7 fixes the
biggest one in code.

## What you'll build

A `judge_rubric(question, answer, rubric)` that returns a binary
verdict + critique. Then a fix for the Likert-score trap. Then a
fix for position bias (the "run both orders, count consistent wins"
mitigation from Zheng et al.). Then a real pairwise judge that
detects its own bias and votes `tie` when it disagrees with itself.
