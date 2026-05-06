---
xp: 2
estSeconds: 100
concept: structured-judge-output
code: |
  # the judge's output is the load-bearing contract of this pattern.
  # parse it as structured data, never as natural language.

  # GOOD — structured verdict, easy to branch on:
  good_verdict = {
      "status": "REJECT",
      "feedback": "The second paragraph contradicts the first. Pick one.",
      "score": 4,
  }

  # BAD — free-text verdict you'd parse with `if "good" in verdict.lower()`:
  bad_verdict = "This is mostly good but not great, I'd say a 6/10 if you fixed the contradiction."

  # which one do you want to dispatch on?
  if good_verdict["status"] == "PASS":
      print("done")
  else:
      print("revise:", good_verdict["feedback"])
---

# The judge's output is a contract, not a vibe

The single most-broken evaluator-optimizer in the wild has the same
bug: parsing the judge's verdict from free text. The code looks
something like:

```python
verdict = judge(draft)
if "good" in verdict.lower() or "pass" in verdict.lower():
    return draft
```

This breaks the first time the judge says *"this is **not** good"* —
the substring match sees `"good"`, returns happily, and ships the
broken draft.

Three hardening levels, in production order:

## Level 1 — XML tags (Anthropic cookbook style)

Force the judge to wrap its verdict in a fixed token:

```
<evaluation>PASS</evaluation>
or
<evaluation>NEEDS_IMPROVEMENT</evaluation>
<feedback>...</feedback>
```

You parse by extracting the contents of `<evaluation>`. Robust enough
for prototypes; the cookbook ships it.

## Level 2 — Structured output (preferred today)

Use the model's structured-output mode and a JSON schema:

```python
{
  "status": {"type": "string", "enum": ["PASS", "REJECT"]},
  "feedback": {"type": "string"},
  "score": {"type": "integer", "minimum": 1, "maximum": 10}
}
```

The model literally cannot return `"PaSs"` or `"good"` — the schema
forbids it. Anthropic does this via `tools=[...]` (the tool-use
trick). OpenAI does it via `response_format={"type": "json_schema"}`.
Vercel AI SDK does it via `generateObject` + Zod.

## Level 3 — Validate-then-default

Even with structured output, one more belt-and-suspenders line:

```python
status = verdict.get("status", "REJECT")
if status not in {"PASS", "REJECT"}:
    status = "REJECT"  # default to "loop again" — never to PASS
```

The default-on-anomaly is always REJECT, never PASS. Because the
failure mode of "model returned garbage and we shipped" is worse than
"model returned garbage and we did one more revision."

## Why a separate judge prompt matters

The other half of the contract: the judge cannot share a system
prompt with the generator. Self-preference bias is documented
(arxiv.org/abs/2410.21819) — when the same prompt-personality writes
*and* judges, you get a 90%+ pass rate on iteration 1, regardless of
quality. The judge needs to be told to *find specific defects*, not
asked for an opinion. Different model entirely is even better when
you can afford it.

## Three numbers production loops always have

```python
feedback = None
draft = None
for i in range(MAX_ITERATIONS):       # 1. cap
    draft = generator(task, feedback=feedback)
    verdict = judge(draft)            # 2. structured verdict
    if verdict["status"] == "PASS":
        return draft
    feedback = verdict["feedback"]    # 3. feedback flows back
return draft  # bail with the latest draft, never raise
```

Three load-bearing pieces: **MAX_ITERATIONS**, **structured verdict**,
**feedback threaded back into the generator**. Miss any one and the
loop fails — runs forever, ships garbage, or never improves.
