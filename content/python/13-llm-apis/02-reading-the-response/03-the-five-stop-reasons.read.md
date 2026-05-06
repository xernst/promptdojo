---
xp: 2
estSeconds: 95
concept: stop-reason-routing
code: |
  # five stop_reason values mapped to what your code should do.
  ROUTES = {
      "end_turn":      "Print the text. Exit the loop. Done.",
      "tool_use":      "Run the tools. Append tool_result. Call the model again.",
      "max_tokens":    "Output cut off. Bump max_tokens or split the task.",
      "stop_sequence": "A custom stop string fired (rare).",
      "pause_turn":    "Hosted tool ran out of time. Resume by re-calling.",
  }

  for reason, action in ROUTES.items():
      print(f"{reason:14}→ {action}")
---

# Five stop reasons, two that drive 99% of code

Your agent loop's main control flow IS branching on `stop_reason`.
Get this wrong and the loop either exits early or never exits.
Five values you'll see:

## `end_turn` — the model is done

The model finished saying what it had to say. Read the text from
`content`, return it to the user, exit the loop. This is the
"normal" end state for non-agent calls.

## `tool_use` — the model wants you to run something

The model emitted at least one `tool_use` block. Your code:

1. Runs each tool by name with its input.
2. Appends a user-role turn with `tool_result` blocks (one per
   `tool_use_id`).
3. Calls the model again with the appended history.

The loop continues until `end_turn` (or you hit your iteration cap).

## `max_tokens` — the response was cut off

You set `max_tokens=1024` and the model wanted to write more. The
output is *truncated mid-sentence*. Two options:

1. Bump `max_tokens` and retry the whole call (simple, sometimes
   wasteful).
2. Continue the conversation by sending the truncated response
   back as the assistant's prior turn and asking "continue."

In production agents, you cap `max_tokens` aggressively *and*
detect this stop reason as a signal that the task was too big.
Catching it loudly beats silently shipping a half-answer.

## `stop_sequence` — a custom stop hit

You passed `stop_sequences=["\n\nUser:", "STOP"]` and one of those
strings appeared in the output. Rare in production; common in
fine-tuned-model legacy code. If you see this, you know the
prompt set up custom delimiters; the response was intentionally
cut at one.

## `pause_turn` — server-side tool ran out of time

Anthropic-only. When you use Anthropic's *hosted* tools (their
server runs the tool, not yours) and the tool's internal loop
caps out, you get `pause_turn` instead of an error. The fix: just
call the API again with the same messages — the server resumes
from where it paused.

## What this maps to in code

```python
def drive_loop(response, messages, run_tool):
    if response.stop_reason == "end_turn":
        return extract_text(response.content), "done"

    if response.stop_reason == "tool_use":
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": run_tool(block.name, block.input),
                })
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
        return None, "continue"

    if response.stop_reason == "max_tokens":
        return None, "truncated"

    # stop_sequence, pause_turn, refusal: handle as needed
    return None, response.stop_reason
```

Two branches drive 99% of agent code. The others are exception
paths. The bug step 7 fixes: hardcoding `if response.stop_reason
== "stop"` (a value that *doesn't exist* in the API — it's a
common misremembering of `end_turn`).

## Anthropic vs OpenAI: the same field, slightly different

OpenAI's Responses API exposes `response.status` (`completed`,
`incomplete`, `failed`) at the response level, plus per-output
`finish_reason` (`stop`, `length`, `tool_calls`, `content_filter`).
Same idea, different vocabulary. Code that targets both providers
typically wraps `stop_reason` / `finish_reason` into a normalized
enum.

The principle is universal: every modern LLM API tells you *why*
it stopped, and your code branches on that field.
