---
xp: 2
estSeconds: 90
concept: minimal-trace-record
code: |
  # the minimum viable trace record per turn.
  # six fields. anything else is nice-to-have.

  trace = []

  turn_record = {
      "turn":              1,
      "stop_reason":       "tool_use",
      "tools_called":      ["search"],
      "input_tokens":      412,
      "output_tokens":     38,
      "validation_errors": 0,
  }
  trace.append(turn_record)

  for k, v in turn_record.items():
      print(f"{k}: {v}")
---

# Six fields, no more

A real LangSmith run has dozens of fields per span. A real Phoenix
trace has tree structure with parent/child relationships. But for
the *bare-metal version that teaches what's underneath*, six fields
per turn cover every question you'll be asked at 2am:

| Field | Question it answers |
|---|---|
| `turn` | Which step in the loop are we looking at? |
| `stop_reason` | Why did the model stop here? |
| `tools_called` | What did the model do this turn? |
| `input_tokens` | How much did we send? |
| `output_tokens` | How much came back? |
| `validation_errors` | How many tool calls were rejected before running? |

Sum across all turns and you have cost (in/out tokens), latency
proxy (turn count), reliability (validation error rate), and tool
usage profile.

## Append-only is the contract

The trace list is **append-only** during a run. You add records as
turns complete. You never modify a record after it's recorded.
You never remove a record. You never reorder.

This isn't religious. It's because:

1. **Debugging needs a faithful timeline.** If turn 3 looks weird,
   turn 3's record at the time it happened is what you need —
   not turn 3 retroactively cleaned up.
2. **Mutation breaks shared traces.** If your eval suite passes the
   same `trace` list to multiple consumers (a logger, a dashboard,
   a unit test), mutation by one corrupts the others.
3. **It maps cleanly to streaming exports.** A trace that's
   append-only is the same shape as a JSONL file growing on disk
   or a stream of log lines piped to LangSmith.

The append-only contract is also why production code uses **deep
copies** when adding records — never the live mutable object
itself. Step 6 fixes the bug where a beginner appends a reference
and watches subsequent turns retroactively edit history.

## Reading the trace, after the fact

The eval suite reads the trace to verify behavior:

```python
result = run_agent("capital of France?")
trace = result["trace"]

# how many turns?
assert len(trace) <= 3

# did it exit cleanly?
assert trace[-1]["stop_reason"] == "end_turn"

# how many tools did it call total?
total_tools = sum(len(t["tools_called"]) for t in trace)
assert total_tools <= 2

# was the answer correct?
assert "Paris" in result["answer"]
```

Four assertions, three of them about the *trace*, one about the
*answer*. Pure-output evals check what the agent said. Trace evals
check *how* the agent got there. Production suites need both —
because you can ship an agent that gives the right answer the
expensive way, and find out about the bill at the end of the
month.

## Why this is the capstone-shaped lesson

Chapters 20 and 21 each taught one half of this — chapter 20 gave
you trace literacy, chapter 21 gave you eval discipline. This
lesson wires them through your own agent code, in your own
language. The eval suite you write here is the difference between
"I built an agent" and "I built an agent that ships."
