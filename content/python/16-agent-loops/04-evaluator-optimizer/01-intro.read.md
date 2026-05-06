---
xp: 1
estSeconds: 120
concept: evaluator-optimizer-pattern
code: |
  # the loop in 8 lines: draft, judge, revise on REJECT, exit on PASS.

  def write_with_judge(task, generator, judge, max_iters=5):
      feedback = None
      draft = None
      for i in range(max_iters):
          draft = generator(task, feedback=feedback)
          verdict = judge(draft)
          if verdict["status"] == "PASS":
              return draft, i + 1
          feedback = verdict["feedback"]
      return draft, max_iters

  # mock generator + judge so the function runs without a real model.
  drafts = iter(["Cats are animals.", "Cats are small carnivorous mammals."])
  verdicts = iter([
      {"status": "REJECT", "feedback": "Too short. Add detail."},
      {"status": "PASS",   "feedback": "Clear and detailed."},
  ])

  result, iters = write_with_judge(
      "Describe cats",
      generator=lambda task, feedback=None: next(drafts),
      judge=lambda draft: next(verdicts),
  )
  print(f"final draft (iter {iters}): {result}")
runnable: true
---

# Two prompts beat one mega-prompt

There's a reason the best AI features look like Cursor's "let me try
again" loop and not like a single long prompt: when one model writes
and a *different* prompt critiques, you get to keep iterating until
the output meets a bar. One prompt has to be everything to everyone
and ships its first guess.

That's the evaluator-optimizer pattern. Anthropic calls it out as one
of the five canonical agent workflows in *Building Effective Agents*:

> "In the evaluator-optimizer workflow, one LLM call generates a
> response while another provides evaluation and feedback in a loop."

The shape is a tiny state machine:

```
   ┌────────────┐  draft   ┌────────────┐
   │ Generator  ├──────────▶  Evaluator │
   └────────────┘          └─────┬──────┘
        ▲                        │
        │ feedback (REJECT)      │ verdict
        └────────────────────────┘
                                 │
                                 │ PASS
                                 ▼
                              return
```

Two model calls per loop iteration. One generates. One judges. If the
judge accepts, you're done. If not, the judge's feedback flows into
the next generation as additional context, and you go again. With a
ceiling on iterations so a stubborn judge doesn't bankrupt you.

## When this pattern earns its keep

Anthropic's two signals:

1. **A human articulating their feedback would demonstrably improve
   the response.** If the response is already as good as you can make
   it by talking to it, the loop has nothing to optimize.
2. **The LLM can produce that kind of feedback.** Some domains the
   judge is great at (code style, factual coverage, tone). Others it
   isn't (mathematical correctness, factual recall against a database
   it can't see).

Two textbook fits: literary translation (you can keep refining
nuance) and code review (correctness + style + complexity, all
checkable in text). Two textbook anti-fits: arithmetic (no amount of
critique will fix a wrong number) and "is this funny" (judge has no
ground truth).

## What everyone calls it

| Framework | Name |
|---|---|
| Anthropic cookbook | `evaluator_optimizer` (XML `<evaluation>PASS</evaluation>` protocol) |
| LangGraph | "Evaluator-optimizer workflow" — two nodes + conditional edge |
| Vercel AI SDK | "Evaluator-Optimizer" pattern — `generateText` + `generateObject` + `while` |
| AutoGen | "Reflection" design pattern — two agents in a loop |
| OpenAI Agents SDK | No native primitive — manual `Agent` + `Agent` driver |

Same primitive everywhere: a writer, a judge, a feedback channel, a
ceiling. You'll write the framework-free version in step 8. Once you
have, you'll read every framework's wrapper and recognize what it's
hiding.

## What you'll build

A `write_with_judge(task, generator, judge, max_iters)` that runs the
loop. Then a fix for the most common bug (parsing the judge's
verdict from free text instead of structured output). Then the cap
fix everyone forgets. Then a real version that threads the judge's
feedback back into the generator and counts iterations.
