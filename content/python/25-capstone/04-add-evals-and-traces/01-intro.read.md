---
xp: 1
estSeconds: 110
concept: instrument-then-eval
code: |
  # one trace record per turn. one eval suite over the whole agent.
  # together: an agent you can ship without crossing your fingers.

  def run_agent_with_trace(question, fake_model, tools):
      messages = [{"role": "user", "content": question}]
      trace = []
      for i in range(5):
          response = fake_model(messages)
          trace.append({
              "turn": i + 1,
              "stop_reason": response["stop_reason"],
              "input_tokens":  response["usage"]["input_tokens"],
              "output_tokens": response["usage"]["output_tokens"],
          })
          if response["stop_reason"] == "end_turn":
              return {"answer": response["content"][0]["text"], "trace": trace}
          # tool dispatch elided
      return {"answer": "capped", "trace": trace}

  def fake_model(messages):
      return {"stop_reason": "end_turn", "content": [{"type": "text", "text": "Paris"}], "usage": {"input_tokens": 30, "output_tokens": 5}}

  result = run_agent_with_trace("capital of France?", fake_model, {})
  print(f"answer: {result['answer']}")
  print(f"turns:  {len(result['trace'])}")
  print(f"tokens: {sum(t['input_tokens'] + t['output_tokens'] for t in result['trace'])}")
runnable: true
---

# An agent without measurement is a bet, not a feature

Lesson 03 made the agent reject bad inputs. This lesson makes the
agent measurable. Two pieces, both load-bearing in production:

## 1. Trace — record everything, every turn

A trace is the structured record of every turn the agent took:
which tool was called, what it returned, what `stop_reason` came
back, how many tokens flowed in and out. Chapter 20 explained the
*shape* of traces. This lesson wires one into your agent.

The minimum viable trace, per turn:

```python
{
    "turn": 1,
    "stop_reason": "tool_use",
    "tools_called": ["search"],
    "input_tokens": 412,
    "output_tokens": 38,
    "validation_errors": 0,
}
```

That's enough to answer the four questions you'll be asked when
something breaks: how many turns did it take, what stopped it, what
tools ran, what did it cost. Production tracers (LangSmith,
Helicone, Phoenix) capture more — span trees, full
inputs/outputs, prompt diffs across runs — but the shape above is
what every single one of them encodes.

## 2. Eval suite — assert on outputs, automate the loop

Chapter 21 ranked four eval patterns. The agent doesn't change
which pattern you pick — the agent's *output* is just a string and
the suite runs the same way. What changes: the cases. An eval case
for an agent is `(question, expected_property)`, where
`expected_property` might be:

- **exact** — the answer string equals a known reference
- **contains** — the answer contains a required substring
  ("Paris", "$199.99", `2024-04-15`)
- **schema** — the answer matches a JSON schema (when the agent
  returns structured output)
- **judge** — an LLM-as-judge (lesson 21-02) verifies semantic
  correctness

For an agent capstone, the practical default is `contains` for
fact-recall cases plus an LLM-as-judge for "did it sound like a
human did this." Two patterns covers 90% of capstone needs.

## What `assert` you write, and where

The eval suite calls the agent with a question, gets back the
result + trace, then asserts properties of *both*:

```python
result = run_agent("capital of France?")
assert "Paris" in result["answer"]                 # output check
assert len(result["trace"]) <= 3                   # turn cap
assert result["trace"][-1]["stop_reason"] == "end_turn"  # didn't error out
```

Three assertions, three different layers. Output correctness, turn
budget, exit cleanliness. Real production suites have 50–200 cases;
the principle is the same.

## What you'll build

A `run_agent_with_trace(question)` that emits a trace per turn,
then `run_eval_suite(cases)` that runs the agent on each case and
asserts both output and trace properties. Then the bug everyone
hits: writing an eval that just re-asserts what the agent did
(tautological), instead of checking against an independent ground
truth.
