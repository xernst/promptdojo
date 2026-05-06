---
xp: 1
estSeconds: 110
concept: schema-validate-before-dispatch
code: |
  # the model occasionally invents tool args. validation catches it
  # BEFORE your tool runs and produces an obscure crash.

  TOOL_SCHEMAS = {
      "search": {"required": ["q"], "types": {"q": str}},
      "read_page": {"required": ["url"], "types": {"url": str}},
  }

  def validate(tool_name, args):
      schema = TOOL_SCHEMAS.get(tool_name)
      if schema is None:
          return False, f"unknown tool: {tool_name}"
      for field in schema["required"]:
          if field not in args:
              return False, f"missing field: {field}"
      for field, expected in schema["types"].items():
          if field in args and not isinstance(args[field], expected):
              return False, f"wrong type for {field}: expected {expected.__name__}"
      return True, "ok"

  print(validate("search", {"q": "ramen"}))                  # ok
  print(validate("search", {"query": "ramen"}))              # missing field q
  print(validate("search", {"q": 42}))                       # wrong type
  print(validate("frobnicate", {"x": 1}))                    # unknown tool
runnable: true
---

# The model is creative. The schema is honest.

Lesson 02 wired the real Anthropic SDK shape. The next failure mode
that bites in production is the one nobody warns you about:
**sometimes the model invents arguments**. It calls your `search`
tool with `{"query": "ramen"}` instead of `{"q": "ramen"}`. It
passes a number where you expected a string. It calls a tool that
doesn't exist.

Without validation, your code does one of three bad things:

1. **`KeyError`** when you read `args["q"]` — crash, lose the
   conversation, page on-call.
2. **Silent wrong behavior** when the tool runs but with garbage —
   the model gets a confusing result and starts making things up.
3. **`AttributeError` at runtime** five frames deep, no clue what
   actually went wrong.

Validation catches it at the boundary. The schema you give the
model in `tools=[...]` is the same schema your code validates
against before dispatching. If they ever drift, you find out
*before* the tool runs, return a clean error message to the model
as the tool result, and the model self-corrects.

## What this looks like in production

In production code, validation is one line:

```python
from pydantic import BaseModel

class SearchInput(BaseModel):
    q: str

# in the dispatch loop:
try:
    args = SearchInput.model_validate(tool_use_block.input)
except ValidationError as e:
    return f"invalid args: {e.errors()[0]['msg']}"
```

Pydantic generates the JSON Schema you send to the model AND the
validator you run on the response. Same schema, both sides.

We're not using Pydantic in this lesson. The point of the capstone
is to *see* what Pydantic does so you understand what you're
trusting. The hand-rolled `validate()` function in the editor is
the bare-metal equivalent — twelve lines, no install, deterministic
behavior. When you swap to real Pydantic in production, you delete
this and replace with two lines.

## What you'll build

A `dispatch_with_validation(tool_use_block)` that looks up the
schema, validates the model's input, runs the tool only on valid
input, and returns a `tool_result` block either way — never
crashes, never raises, always closes the loop. Then the bug
everyone hits: forgetting to convert a `ValidationError` into a
tool result, leaving the loop in a broken state.
