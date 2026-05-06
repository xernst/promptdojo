---
xp: 1
estSeconds: 110
concept: response-shape-fundamentals
code: |
  # the response from Anthropic's messages.create — shape only,
  # mocked so it runs without API keys.

  response = {
      "id": "msg_01abc",
      "model": "claude-sonnet-4-6",
      "stop_reason": "end_turn",
      "content": [
          {"type": "text", "text": "Paris is the capital of France."},
      ],
      "usage": {
          "input_tokens": 28,
          "output_tokens": 9,
      },
  }

  # three things you read from EVERY response:
  print(f"stop_reason: {response['stop_reason']}")
  print(f"text: {response['content'][0]['text']}")
  print(f"tokens: {response['usage']['input_tokens']} in / {response['usage']['output_tokens']} out")
runnable: true
---

# Three things every response carries

Lesson 01 wired the messages pattern — how you talk TO the model.
This lesson is the other half: how you read what comes BACK.

Every modern LLM API response carries three things you'll touch on
every call. The names differ slightly between Anthropic and
OpenAI, but the shape is the same:

| Anthropic Messages API | OpenAI Responses API | What it is |
|---|---|---|
| `response.content[]` (list of blocks) | `response.output[]` (list of blocks) | What the model said |
| `response.stop_reason` | `response.status` (+ `response.output[].finish_reason` per block) | Why it stopped |
| `response.usage.input_tokens` / `.output_tokens` | `response.usage.input_tokens` / `.output_tokens` | What it cost |

You'll iterate `content` to get text and tool calls, branch on
`stop_reason` to drive your loop, and sum `usage` to track cost.
This lesson locks in the access patterns.

## Content is a LIST, even when there's one block

The single most-shipped beginner bug:

```python
# WRONG — assumes content is a string
print(response.content)              # → "<TextBlock object at 0x...>"

# WRONG — assumes the first block is always there and always text
print(response.content[0].text)      # → fails when content[0] is a tool_use block
```

The right way is to iterate, branch on `.type`, and handle each
block kind:

```python
for block in response.content:
    if block.type == "text":
        print(block.text)
    elif block.type == "tool_use":
        print(f"calling {block.name} with {block.input}")
```

You'll see `text`, `tool_use`, and (when extended thinking is on)
`thinking` blocks. Always branch on `type`; never index blindly.

## `stop_reason` is the loop driver

Five values you'll see, ordered by frequency:

| Value | What it means |
|---|---|
| `end_turn` | Model is done. Print the text and exit your loop. |
| `tool_use` | Model wants to run a tool. Run it, send back a `tool_result`, call again. |
| `max_tokens` | The response was cut off. Bump `max_tokens` or split the task. |
| `stop_sequence` | A custom stop string fired (rare). |
| `pause_turn` | A hosted tool's turn ran out of time (Anthropic's hosted tools only). |

Two stop reasons cover 99% of agent loops: `end_turn` and
`tool_use`. The others are exception paths. Chapter 16 builds the
full agent loop; this lesson teaches you to read the field.

## `usage` is your bill

```python
response.usage.input_tokens          # what you sent (prompt + history)
response.usage.output_tokens         # what came back
response.usage.cache_read_input_tokens     # cached read (0.1× price)
response.usage.cache_creation_input_tokens # cache write (1.25× or 2× price)
```

The cache fields are zero unless you opted in to prompt caching
(chapter 23 covers that). Input and output are non-zero on every
call. Sum them across an agent loop and you have the cost.

The bug worth naming: agents that don't track `usage` find out
about the bill at the end of the month, not in real time.

## What you'll build

A `parse_response(response)` that takes a response dict (or real
SDK object), returns a structured `{"text": ..., "tool_uses":
[...], "stop_reason": ..., "tokens": ...}` shape. Then a fix for
the most common bug: hardcoding `content[0].text` even when the
first block is a tool_use.
