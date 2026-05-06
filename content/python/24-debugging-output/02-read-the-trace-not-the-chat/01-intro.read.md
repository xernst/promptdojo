---
xp: 1
estSeconds: 110
concept: trace-first-debugging
code: |
  # a trace dump from a broken agent run.
  # the user's complaint: "it gave me the wrong city."
  # before reading the chat, find the bad turn in the trace.

  trace = [
      {"turn": 1, "stop_reason": "tool_use", "tools_called": ["search"],    "tokens": 412, "validation_errors": 0},
      {"turn": 2, "stop_reason": "tool_use", "tools_called": ["read_page"], "tokens": 880, "validation_errors": 0},
      {"turn": 3, "stop_reason": "tool_use", "tools_called": ["search"],    "tokens": 920, "validation_errors": 1},  # ← something here
      {"turn": 4, "stop_reason": "end_turn", "tools_called": [],            "tokens": 145, "validation_errors": 0},
  ]

  # find the turn with a non-zero validation_errors count.
  for t in trace:
      if t["validation_errors"] > 0:
          print(f"suspect turn: {t['turn']}, tools_called: {t['tools_called']}")
runnable: true
---

# When the model lies, the trace tells you why

A user complains. The chat shows a wrong answer. Three things will
happen if you start by reading the chat:

1. You'll re-read the same wrong sentence five times looking for the
   bug.
2. You'll think the model "hallucinated" and tweet about it.
3. You'll ship a regex post-filter that hides the symptom.

None of those finds the actual bug. The trace does. **Always read
the trace first.** The chat is the symptom; the trace is the
evidence.

This lesson teaches the methodology: find the broken turn from the
trace, classify the failure class, fix UPSTREAM of where it
surfaced, then add an eval that would have caught it. Chapter 20
gave you trace literacy — what each field means. Chapter 21 gave
you eval discipline — what to assert. This lesson wires them into
a single triage flow.

## What's in a trace, restated

From the capstone you already know the shape:

```python
{
    "turn": 1,
    "stop_reason": "tool_use",
    "tools_called": ["search"],
    "tokens": 412,
    "validation_errors": 0,
}
```

Six fields. Read them in this order when triaging:

1. **`validation_errors`**: any non-zero value? That turn shows the
   model called a tool with bad args. Likely the source.
2. **`stop_reason`**: anything other than `tool_use`/`end_turn`?
   `max_tokens` truncates output mid-thought; `pause_turn` means a
   hosted tool ran out of time; `refusal` is a safety stop.
3. **`tools_called`**: what tools ran? Re-running the same tool 3+
   times in a row is a tool-loop bug — the tool result didn't
   actually help.
4. **`tokens`**: spike on one turn? The model received a giant
   prompt — chunking issue, or a tool returned a 50K-character
   response.

Most bugs land on the first or third row. The trace is sorted; the
*first* turn that violates an assertion is usually where the bug
started.

## Where the bug actually lives

Production AI bugs sort into four classes. The trace tells you
which:

| Class | Symptom in the trace | Actual fix |
|---|---|---|
| **Retrieval** | tool returned wrong/missing data | fix retrieval, not the prompt |
| **Prompt** | model interpreted instructions wrong | fix the prompt, add a few-shot |
| **True hallucination** | no tool ran, no retrieval; model made it up | constrain output (schema, citations) |
| **Downstream mangling** | trace looks fine; output is wrong | fix the JSON parse / regex / display layer |

The wrong fix applied to the wrong class is the most common waste
of debugging time. **The fix lives at the layer the trace points
to**, not at the layer where the user sees the symptom.

## What "fix upstream of where it surfaced" means

A user sees a JSON parse error. The natural reflex: catch the parse
error, retry, ship. The trace says: the model returned valid JSON
on turn 1, and your post-processor mangled it on the way to the
display layer.

The fix isn't "catch and retry." The fix is "stop mangling the
JSON." Otherwise next month a different bug will produce the same
symptom and you'll add a second retry, then a third.

## What you'll build

A `find_suspect_turn(trace)` that scans the trace and returns the
first turn that violates an assertion (non-zero validation errors,
non-end_turn final stop, etc.). Then a `summarize_trace(trace)`
that produces a one-line summary suitable for filing in a bug
ticket. Then the discipline drill: given a trace + a user
complaint, classify the failure class.
