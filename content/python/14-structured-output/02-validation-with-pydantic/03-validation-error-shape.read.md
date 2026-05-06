---
xp: 2
estSeconds: 100
concept: validation-error-structure
code: |
  from pydantic import BaseModel, ValidationError

  class User(BaseModel):
      name: str
      age: int
      email: str

  # one bad input with multiple errors at once.
  try:
      User.model_validate({"name": "Ada", "age": "not a number", "email": 42})
  except ValidationError as e:
      print(f"error count: {len(e.errors())}")
      for err in e.errors():
          field = err["loc"][0] if err["loc"] else "(root)"
          print(f"  field={field} type={err['type']} msg={err['msg'][:50]}")
---

# `ValidationError` is structured — read it like a list of bug reports

Pydantic's failure mode is opinionated: when validation fails, it
collects ALL the errors it can find and raises ONE
`ValidationError` containing them as a list. This matters because
the model often gets multiple fields wrong at once, and you want to
see all of them.

## The shape of `e.errors()`

```python
[
    {
        "type":  "string_type",        # the kind of failure
        "loc":   ("name",),             # path to the bad field
        "msg":   "Input should be a valid string",
        "input": 42,                    # what the model actually sent
        "url":   "https://errors.pydantic.dev/2.x/v/string_type",
    },
    {
        "type":  "missing",
        "loc":   ("email",),
        "msg":   "Field required",
        ...
    },
]
```

Five fields per error:

- **`type`** — machine-readable error code. Branch on this when you
  want to react differently to "missing field" vs "wrong type" vs
  "constraint violation."
- **`loc`** — tuple path to the bad field. For top-level fields,
  it's `("field_name",)`. For nested models, it's
  `("parent", "child", "field")`. Always a tuple.
- **`msg`** — human-readable error message. Good for surfacing to
  users.
- **`input`** — what was actually received. Critical for debugging:
  shows you what the model sent vs what your schema expected.
- **`url`** — link to Pydantic's error documentation. Skip for
  display; useful for issue triage.

## Reading errors back to the model

The whole point of structured errors: you can format them as a
tool_result and feed them back to the model on the next turn. The
model self-corrects. The pattern:

```python
def explain_errors(e: ValidationError) -> str:
    lines = []
    for err in e.errors():
        field = ".".join(str(p) for p in err["loc"]) or "(root)"
        lines.append(f"- {field}: {err['msg']}")
    return "Validation errors:\n" + "\n".join(lines)

# in the agent loop, after model output:
try:
    result = MyModel.model_validate(raw)
except ValidationError as e:
    feedback = explain_errors(e)
    # send feedback as the next user turn → model retries with valid output
```

This is the single most-leveraged use of Pydantic in agent code.
The error structure is the teaching channel back to the model.

## Why catch `ValidationError` specifically (not `Exception`)

The most common bug in beginner Pydantic code:

```python
try:
    user = User.model_validate(raw)
except Exception:                 # ← too broad
    user = None
```

`except Exception` catches `ValidationError` — but it ALSO catches
`KeyError`, `NameError`, `TypeError` from your *own bug* somewhere
upstream. You set `user = None` and the agent silently runs with
no user data. The bug never surfaces; the user gets wrong answers
forever.

The fix is one word:

```python
try:
    user = User.model_validate(raw)
except ValidationError:           # ← exactly the right type
    user = None
```

Now your own bugs propagate normally; only schema-mismatch errors
get caught here. This is the bug step 6 fixes.

## What this lesson does NOT cover

- **Nested models / discriminated unions** — Pydantic supports them
  with the same surface. Out of scope here.
- **Custom validators** — `@field_validator`, `@model_validator`.
  Powerful but advanced; reach for them when you need
  cross-field constraints.
- **JSON Schema generation** — `Model.model_json_schema()` is the
  one-liner you use when wiring Pydantic to OpenAI/Anthropic
  structured-output APIs. Out of scope here, named so you can grep
  for it later.

What you're locking in: the validate-or-fail-with-structured-errors
contract. That's the foundation everything else builds on.
