---
xp: 2
estSeconds: 90
concept: validator-three-checks
code: |
  # production validators do three checks. teach all three with one function.

  def validate(args, schema):
      # 1. required fields present?
      for field in schema.get("required", []):
          if field not in args:
              return {"ok": False, "error": f"missing required field: {field}"}

      # 2. types match?
      for field, expected_type in schema.get("types", {}).items():
          if field in args and not isinstance(args[field], expected_type):
              actual = type(args[field]).__name__
              return {"ok": False, "error": f"{field} should be {expected_type.__name__}, got {actual}"}

      # 3. constraints satisfied?
      for field, check in schema.get("constraints", {}).items():
          if field in args:
              ok, msg = check(args[field])
              if not ok:
                  return {"ok": False, "error": f"{field}: {msg}"}

      return {"ok": True, "args": args}

  schema = {
      "required": ["page_size"],
      "types": {"page_size": int},
      "constraints": {"page_size": lambda v: (1 <= v <= 100, "must be 1..100")},
  }

  print(validate({"page_size": 25}, schema))         # ok
  print(validate({"page_size": "25"}, schema))       # type error
  print(validate({"page_size": 999}, schema))        # constraint error
  print(validate({}, schema))                         # missing field
---

# Three checks every validator does

A real Pydantic model encodes three things the runtime checks before
your code sees the input. Hand-rolled or framework-generated, the
shape is the same:

## 1. Required fields

Did every required field arrive? `args["q"]` raises `KeyError` if
not, so check up front and return a clean error message instead.

## 2. Types

Is each present field the expected Python type? `isinstance(value,
expected)` covers most cases — `str`, `int`, `float`, `bool`,
`list`, `dict`. For more elaborate types (`list[int]`, optional
fields, nested models) production code uses Pydantic's full type
system; the bare-metal version covers the cases you actually see in
tool inputs.

## 3. Value constraints

Even when the type is right, the value can be wrong. `page_size:
int` doesn't catch `page_size: 99999999`. Encode the constraint
(`1 ≤ page_size ≤ 100`) and check it.

In Pydantic, this is `Annotated[int, Field(ge=1, le=100)]` or a
`@field_validator`. In the hand-rolled version above, it's a lambda
that returns `(ok, message)`.

## What makes validation worth doing

Validation isn't free. It runs on every tool call. The reason it's
non-negotiable in production: **the alternative is debugging the
agent loop from a stack trace five frames deep, while the user is
waiting**. A model that called your tool with the wrong field name
would otherwise crash silently inside the tool's first DB query —
your trace shows "DatabaseError on row 0" and you'd waste an hour
chasing the wrong layer.

With validation, the trace says `tool_use search → invalid args:
missing required field q`. You see exactly where it went wrong, and
critically: **the model sees it too**, in the next `tool_result`
block, and tries again with corrected input.

That's the load-bearing piece. Validation isn't just a guard rail —
it's a *teaching channel* back to the model. Return the error as
the tool result, the model usually self-corrects on the next turn.
Without it, you crash, lose context, and the user starts over.

## Where this fits in the loop

```python
for block in response.content:
    if block.type == "tool_use":
        verdict = validate(block.input, TOOL_SCHEMAS[block.name])
        if verdict["ok"]:
            output = TOOLS[block.name](**verdict["args"])
        else:
            output = f"VALIDATION ERROR: {verdict['error']}"
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": output,
        })
```

The shape of the loop doesn't change. One `validate()` call between
"the model said run this tool" and "we ran the tool." If the
verdict is bad, the tool never runs and the model gets the error
message instead.
