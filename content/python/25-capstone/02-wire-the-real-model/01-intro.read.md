---
xp: 1
estSeconds: 130
concept: real-sdk-swap
code: |
  # the swap looks like THIS in production. one line of import + one line of construct.
  # everything else — the loop, the tool dispatch, the message hygiene — is unchanged.
  #
  # import os
  # from anthropic import Anthropic
  #
  # client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
  #
  # def call_model(messages, tools):
  #     return client.messages.create(
  #         model="claude-sonnet-4-6",
  #         max_tokens=1024,
  #         messages=messages,
  #         tools=tools,
  #     )

  # in this lesson we run a Pyodide-friendly mock with EXACTLY the same shape,
  # so when you copy the loop to production, the only thing that changes is
  # the import.

  class MockTextBlock:
      def __init__(self, text):
          self.type = "text"
          self.text = text

  class MockResponse:
      def __init__(self, stop_reason, content):
          self.stop_reason = stop_reason
          self.content = content

  fake_response = MockResponse(
      stop_reason="end_turn",
      content=[MockTextBlock("Paris is the capital of France.")],
  )

  # access pattern matches the real SDK exactly:
  print(fake_response.stop_reason)
  print(fake_response.content[0].type)
  print(fake_response.content[0].text)
runnable: true
---

# Same loop, real model

Lesson 1 wrote the agent loop on top of `fake_llm` — a function that
returned canned response dicts. The whole point of building it that
way was that the loop is the load-bearing part. The model is
swappable.

Here's what the swap actually looks like. Two lines change:

```python
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
```

That's it. The `messages.create(...)` call returns a response object
whose `.stop_reason`, `.content`, `.content[i].type`, and
`.content[i].text` access patterns are identical to the dict-shaped
mock you built. The loop you wrote in lesson 1 runs on real
production traffic with no other code changes.

Three pieces this lesson locks in:

## 1. The key lives in the environment

`os.getenv("ANTHROPIC_API_KEY")` — never hardcoded, never in source,
never committed. Chapter 18 set this up; this is the chapter where
it actually matters because the request goes out to a real billed
endpoint.

The two reflexes you'll fight:

- **Putting the key in the source for "just this one test."** It
  ends up in git history. You rotate the key. Two days later you
  notice the bill. By then it's too late.
- **Putting the key in `os.environ["ANTHROPIC_API_KEY"]` (bracket
  access).** This raises `KeyError` if the env var is missing.
  `os.getenv` returns `None` and lets you give a clear error
  upstream. Always `getenv`, never bracket.

## 2. The SDK response is OBJECTS, not dicts

The mock you wrote in lesson 1 used dicts (`response["stop_reason"]`,
`response["content"][0]["text"]`). The real SDK uses object access
(`response.stop_reason`, `response.content[0].text`). Almost
identical, slightly different.

Every block in `response.content` has a `.type` field. For text
blocks, `.text`. For tool_use blocks, `.name`, `.input`, `.id`. You
*must* check `.type` before reading the type-specific fields, or
you'll get `AttributeError` on the first tool-using turn.

## 3. The loop doesn't care

The genuinely good news: the loop you wrote in lesson 1 — the
`while`, the `stop_reason` branch, the tool dispatch, the
`messages.append(...)` — all runs unchanged. The mock you'll build
in step 8 has *exactly* the real SDK's attribute shape. Lift the
loop, change the call site, ship it.

## What you'll build

A `MockResponse` with `MockTextBlock` and `MockToolUseBlock` classes
whose attribute access matches real `anthropic.types.Message`. Then
a fix for the most common `KeyError` bug (bracket access on env
vars). Then a fix for the `AttributeError` bug (reading `.text` on a
tool_use block). Then a real shape adapter that takes either a real
SDK response or a mock and runs the loop unchanged.
