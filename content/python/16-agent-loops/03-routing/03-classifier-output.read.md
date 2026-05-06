---
xp: 2
estSeconds: 95
concept: constrained-classifier-output
code: |
  # the classifier MUST return a value the dispatch table knows about.
  # two ways to make that happen: an enum of allowed strings, or a
  # JSON schema with `enum`. both ride on top of structured output.

  ALLOWED = {"billing", "technical", "general"}

  classifier_schema = {
      "type": "object",
      "properties": {
          "category": {"type": "string", "enum": list(ALLOWED)},
          "confidence": {"type": "number"},
      },
      "required": ["category"],
  }

  # what the model returns (constrained to the schema):
  classification = {"category": "billing", "confidence": 0.91}

  print(f"category: {classification['category']}")
  print(f"in allowed set: {classification['category'] in ALLOWED}")
---

# The classifier output is the most important constraint

A routing system fails the *first* time the classifier returns a
string that isn't in your dispatch table. `KeyError`. The user gets
a 500. You get paged.

The fix is constraining the classifier *before* it answers, not
after. Three ways, in increasing reliability:

## 1. Enum in the prompt (weakest)

```
"Classify the user message as one of: billing, technical, general.
 Respond with ONLY the category word, nothing else."
```

This *usually* works. Modern models are obedient. But "usually" is
not a reliability guarantee. Production routers see drift here:
`"Billing"` (capital B), `"billing or technical"`, `"general
question"`. Each is a `KeyError` waiting to happen.

## 2. Structured output with an `enum` schema (strong)

```python
{
  "type": "object",
  "properties": {
    "category": {"type": "string", "enum": ["billing", "technical", "general"]}
  },
  "required": ["category"]
}
```

Now the model can't return `"Billing"` even if it wants to — the
schema rejects it. Anthropic, OpenAI, Google all support this via
their "tool use as structured output" trick: define a tool whose
input schema is your classification schema, force the model to call
it, and read the input.

## 3. Validate-then-fallback (production-grade)

Even with structured output, you want one more layer:

```python
category = classification.get("category", "")
if category not in ALLOWED:
    category = "general"  # or "fallback", or whatever your default is
```

This is the load-bearing line in every routing system that's been
in production for more than a month. Models drift. Schemas can be
bypassed by a prompt-injected user. The dispatch table needs a
safe default.

## What people get wrong

The most common failure mode in beginner routers is using the model
to do *both* the classification and the answer in one call —
"classify this and respond appropriately." The model usually does,
but you've lost the dispatch decoupling. You can't swap out a
specialist. You can't measure per-route cost. You can't log which
route got chosen. Routing earns its value from the explicit
two-call shape — keep them separate.
