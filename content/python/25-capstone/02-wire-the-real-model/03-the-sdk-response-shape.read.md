---
xp: 2
estSeconds: 100
concept: anthropic-sdk-response-shape
code: |
  # the EXACT attribute shape of an anthropic.types.Message object,
  # mocked so you can run it offline.

  class MockTextBlock:
      def __init__(self, text):
          self.type = "text"
          self.text = text

  class MockToolUseBlock:
      def __init__(self, id, name, input):
          self.type = "tool_use"
          self.id = id
          self.name = name
          self.input = input

  class MockMessage:
      def __init__(self, stop_reason, content, usage):
          self.stop_reason = stop_reason
          self.content = content
          self.usage = usage

  class MockUsage:
      def __init__(self, input_tokens, output_tokens):
          self.input_tokens = input_tokens
          self.output_tokens = output_tokens

  # an assistant turn that wants to call a tool:
  resp = MockMessage(
      stop_reason="tool_use",
      content=[
          MockTextBlock("Let me look that up."),
          MockToolUseBlock(id="toolu_01", name="search", input={"q": "ramen"}),
      ],
      usage=MockUsage(input_tokens=412, output_tokens=38),
  )

  for block in resp.content:
      if block.type == "text":
          print(f"TEXT: {block.text}")
      elif block.type == "tool_use":
          print(f"TOOL: {block.name}({block.input}) id={block.id}")

  print(f"tokens in/out: {resp.usage.input_tokens}/{resp.usage.output_tokens}")
---

# The real SDK's response, line by line

The Anthropic Python SDK returns an `anthropic.types.Message`
object. Pyodide can't hit the wire to make a real call, but the
*shape* is what matters — and the mock above matches the real
object exactly. Same attribute names, same types.

Five things to lock in:

## 1. `response.stop_reason` is a string

`"end_turn"`, `"tool_use"`, `"max_tokens"`, `"stop_sequence"`,
`"pause_turn"`, `"refusal"`. Same five values you learned in
chapter 16. The two that drive the loop are still `end_turn` and
`tool_use`; the others are exception paths.

## 2. `response.content` is a LIST of blocks

Even when the model only said one sentence, `content` is
`[TextBlock("...")]`. Always indexable, always iterable. Beginners
write `response.content` and try to print it as if it's a string —
gets you `<TextBlock object at 0x7f...>` and a sad face. Iterate
the list.

## 3. Each block has a `.type` field — branch on it FIRST

```python
for block in response.content:
    if block.type == "text":
        print(block.text)            # text-only attribute
    elif block.type == "tool_use":
        print(block.name, block.input, block.id)  # tool_use attributes
```

Reading `block.text` on a `tool_use` block raises `AttributeError`.
Reading `block.name` on a `text` block raises `AttributeError`. The
`type` field is the discriminator. Always.

A subtle thing: when extended thinking is enabled, you may also see
`thinking` blocks. Add them to your branching or filter them out
before processing — they're not for the user.

## 4. `response.usage` carries the bill

```python
response.usage.input_tokens     # what you sent
response.usage.output_tokens    # what you got back
response.usage.cache_read_input_tokens     # cache hits (huge cost win)
response.usage.cache_creation_input_tokens # cache writes (1.25× input cost)
```

Every turn adds these numbers. A 50-turn agent that doesn't read
its own `usage` field is an agent whose owner finds out about the
bill at the end of the month.

## 5. The dict-style mock from lesson 1 is *almost* right

The `fake_llm` in lesson 1 returned `{"stop_reason": "end_turn",
"content": [{"type": "text", "text": "..."}]}`. That's a dict
shape. The real SDK returns objects with attribute access. Easy
fix in step 8 — wrap the dicts in classes so `.type` and `.text`
work the same as the real SDK. Then your loop runs on either.

## Why bother with the mock when you could just use the real SDK?

Three reasons:

1. **Pyodide can't make HTTPS calls.** No real SDK in the browser.
2. **Tests should be deterministic.** Real models return slightly
   different text every call — your eval suite goes flaky.
3. **You want a no-key escape hatch.** Demo mode, offline dev, CI
   without secrets — all need a mock that matches the real shape.

Step 8 builds that mock in 30 lines. Then your agent loop accepts
either a `MockMessage` or a real `anthropic.types.Message` and
behaves identically.
