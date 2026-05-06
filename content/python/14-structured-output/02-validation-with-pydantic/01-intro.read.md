---
xp: 1
estSeconds: 120
concept: real-pydantic-validation
code: |
  # in a Pyodide notebook (or chapter sandbox), once per session:
  #   import micropip
  #   await micropip.install("pydantic")
  # in this environment pydantic is pre-installed.

  from pydantic import BaseModel, ValidationError

  class Invoice(BaseModel):
      number: str
      total: float
      paid: bool

  raw_from_model = {"number": "INV-7", "total": 199.99, "paid": False}
  invoice = Invoice.model_validate(raw_from_model)
  print(f"validated: {invoice.number}, ${invoice.total}, paid={invoice.paid}")

  # what about bad input?
  try:
      Invoice.model_validate({"number": "INV-8", "total": "ninety-nine"})
  except ValidationError as e:
      first = e.errors()[0]
      print(f"error on field {first['loc'][0]}: type={first['type']}")
runnable: true
---

# Real Pydantic — the production-grade structured-output validator

Lesson 01 asked the model for JSON and parsed it with `json.loads`,
then sanity-checked the shape with `assert isinstance(...)`. That
works for the simplest cases. It rots fast.

The standard tool, in production code, is **Pydantic**. A
`BaseModel` subclass is both:

- A schema you can serialize as JSON Schema and pass to the model
  (`Invoice.model_json_schema()`).
- A validator that parses raw dicts into typed Python objects and
  raises `ValidationError` with a structured error report on bad
  input.

Two things `assert isinstance` can't do that Pydantic can:

1. **Validate nested types.** `Invoice` has fields. Each field has
   its own type. Pydantic checks recursively; one assert per field
   doesn't scale to 30-field schemas.
2. **Tell you exactly what's wrong.** Pydantic's `ValidationError`
   carries a list of structured error dicts: which field, what
   type was expected, what was received. That feeds back to the
   model in the next turn so the model self-corrects.

## Why this is the chapter's load-bearing lesson

Chapter 14's promise: structured output is how you stop guessing
about model output shape. Lesson 01 set up the *concept*. This
lesson uses the *tool*. From here forward, every chapter that
touches model output (16 agent loops, 21 evals, 25 capstone)
assumes you can reach for `BaseModel` when "did the model give us
the right shape?" matters.

## What everyone calls it

| Stack | Primitive |
|---|---|
| **Pydantic v2** | `BaseModel` + `model_validate(d)` + `ValidationError` |
| **OpenAI Python SDK** | `response_format={"type": "json_schema", "json_schema": {...}}` — accepts a Pydantic schema directly |
| **Anthropic SDK** | `tools=[{...}]` with `input_schema` — the "tool-use trick" forces structured output |
| **Vercel AI SDK** | `generateObject({ schema })` — Zod schema in TypeScript; Pydantic equivalent |
| **Instructor** | thin wrapper that adds Pydantic-driven structured output to any provider |

Pydantic is the default. Anything else either wraps it or replaces
it with a similar primitive.

## The `model_validate` contract

```python
from pydantic import BaseModel, ValidationError

class Invoice(BaseModel):
    number: str
    total: float
    paid: bool

# happy path: parses, returns a typed instance.
invoice = Invoice.model_validate({"number": "INV-7", "total": 199.99, "paid": False})
print(invoice.total)            # 199.99 (a real float, not a string)

# unhappy path: raises ValidationError with structured details.
try:
    Invoice.model_validate({"number": "INV-8", "total": "ninety-nine"})
except ValidationError as e:
    for err in e.errors():
        print(err["loc"], err["type"], err["msg"])
```

Two failure modes named explicitly:

- `model_validate` returns a fresh instance — Pydantic doesn't mutate
  your input dict. Useful when you want to keep the raw response
  alongside the validated one.
- `ValidationError.errors()` returns a list (not a single error). On
  one bad input you might get five errors (five fields wrong);
  iterate them when the user-facing message needs to show all.

## What you'll build

A `validate_or_reject(raw, schema_class)` that takes a raw dict and
a `BaseModel` subclass, returns either `{"ok": True, "value":
<instance>}` or `{"ok": False, "errors": [<list of error dicts>]}`.
Then the bug everyone hits: catching `Exception` instead of
`ValidationError`, which swallows real bugs (NameError, KeyError)
that *aren't* validation problems.
