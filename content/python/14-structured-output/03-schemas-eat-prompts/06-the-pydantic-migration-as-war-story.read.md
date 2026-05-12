---
xp: 1
estSeconds: 200
concept: pydantic-migration-lesson
---

# Pydantic v1 → v2: the migration that taught the community where validation belongs

In June 2023, Pydantic v2 shipped. It was rewritten in Rust under the
hood. It was 10x faster. It deprecated `@validator` in favor of
`@field_validator` and `@model_validator`. It renamed `.dict()` to
`.model_dump()`. It changed how `Config` was declared. It changed the
shape of validators' return values.

The migration was brutal. **Half the LLM ecosystem broke for weeks.**
LangChain users got cryptic errors. FastAPI users found their request
handlers raising new validation paths. Internal tooling at half a
dozen large AI startups failed silently because v1 validators got
called with v2 semantics and returned different types.

Why was the blast radius so wide? Because of where Pydantic was
*being used* in 2023.

## The 2023 anti-pattern: Pydantic everywhere

Pydantic v1 was cheap. The community used it for everything:

- **At the API boundary** (FastAPI request bodies) — correct.
- **At the LLM boundary** (validate model output) — correct.
- **Inside business logic** to enforce invariants on intermediate
  values — questionable.
- **As the canonical data model for entities** passed through every
  function in a service — wrong.
- **Inside data-transformation pipelines**, with `@validator` methods
  doing actual business logic mid-validation — very wrong.

By 2023, "is Pydantic" was effectively a synonym for "is a Python
object." Engineers stuck `BaseModel` on every class because validation
was free and felt like good hygiene. Validators contained side
effects: logging, database lookups, even API calls. The migration
exposed all of it. Anything doing real work inside `@validator` broke
hard when v2 changed the validation lifecycle.

The hardest-hit cases:

1. **Validators that mutated other fields.** v1 silently allowed it.
   v2 requires explicit `model_validator(mode="after")`. Hidden
   mutations became loud errors.
2. **Validators with side effects** (writes, API calls, logging).
   v2's stricter execution semantics meant these ran in different
   orders, ran more times, or stopped running entirely depending on
   the field. Half the AI startups had "magic" Pydantic models that
   were quietly logging to Datadog inside their validators. Those
   logs stopped during the migration. Nobody noticed for weeks.
3. **Validators used as business rules.** Things like *"if the
   user's plan is free, the daily quota field can't exceed 100"* —
   that's business logic, not schema validation. v1 let you stuff
   it in. v2 forced the cleanup.

## The lesson the community pulled out of the rubble

When the dust settled, the agreed-upon best practice was the
**boundary-only rule**:

- **Validate at boundaries** (API ingress, LLM response, file
  ingest, queue consumer).
- **Transform inside.** Once data has passed validation and is a
  typed Pydantic instance, downstream code uses plain function calls
  and immutable transformations. No `@validator` for business
  rules. No re-validation in the middle of the pipeline.

This is the rule chapter 14 lesson 02 implied when it taught you
`model_validate_json` at the LLM boundary. This lesson makes it
explicit: **the validator is a customs officer, not a referee
running alongside you on the field.** Customs runs at the border.
After that, the data is in.

## How this changes your code structure

Before (v1-era anti-pattern):

```python
class Receipt(BaseModel):
    vendor: str
    amount: float
    is_taxable: bool

    @validator("amount")
    def must_match_currency_rules(cls, v):
        # business logic stuffed into a validator
        if v > 10_000:
            raise ValueError("requires manager approval")
        return v
```

After (post-migration discipline):

```python
class Receipt(BaseModel):
    vendor: str
    amount: float
    is_taxable: bool
    # NO business rules here. Just shape.

# business rules live in regular functions that consume the
# already-validated typed object.
def requires_manager_approval(r: Receipt) -> bool:
    return r.amount > 10_000
```

The schema only knows what shape the data must have. The business
logic only knows what to do with shape-correct data. The two never
mix. When the schema changes, the business logic doesn't have to be
re-untangled from validator decorators.

## Why this matters for AI code specifically

LLM responses are foreign data. They cross *one* boundary into your
code. That is the only place validation belongs. The temptation —
especially when AI is writing your code — is to add another
validator inside the function that uses the response, "just to be
safe." Don't. Two validators means two sources of truth for the
shape. When they drift (and they will, because Cursor will update
one and forget the other), you get bugs that don't look like
validation bugs at all.

One schema. One validator. One boundary. Everything downstream is a
typed object.

That's the discipline the Pydantic migration taught the community.
The breakages from lesson step 02 of this lesson are what happens
when the habit isn't there.

Time to encode the rule. Next step: you write the boundary auditor.
