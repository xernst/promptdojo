---
xp: 1
estSeconds: 220
concept: schema-replaces-prompt
---

# The strategic shift: a 5-line schema beats a 30-word prompt

In 2023, the dominant pattern for getting structured data out of an
LLM was **prompt-engineering**. You wrote progressively more elaborate
prose at the top of the prompt:

> *Return your answer as valid JSON. Use double quotes, not single
> quotes. Do not include any text before or after the JSON. The JSON
> must have a `name` field (string), an `age` field (integer), and a
> `tags` field (list of strings). Do not include any additional
> fields. If a field is missing, use null. Respond with ONLY the
> JSON.*

This was the state of the art. It mostly worked. About 92% of the
time. The other 8% — across millions of API calls — broke production.

The 2024 shift, accelerated through 2025, was the **schema-first**
pattern. Every word of that prompt got replaced by a 5-line model:

```python
class Person(BaseModel):
    name: str
    age: int
    tags: list[str]
```

Then the model is constrained by the schema, not asked nicely. The
prompt becomes one short instruction (*Extract a person from this
text*) plus the schema. The 8% failure rate drops to a fraction of a
percent.

## Why the shift happened

Three pieces of infrastructure landed within 12 months of each other:

1. **Anthropic tool-use** (mid-2024, mature by mid-2025). You define
   a tool with `input_schema` (JSON Schema). The model is forced to
   call the tool with arguments matching that schema. The schema
   becomes a hard constraint on the model's output, not a request.

2. **OpenAI Structured Outputs** (August 2024). The
   `response_format={"type": "json_schema", "json_schema": {...},
   "strict": true}` mode constrains the model's decoding such that
   every token sampled must keep the output on a path that produces
   schema-valid JSON. Guaranteed parseability. Guaranteed shape.

3. **The `instructor` library** (Jason Liu's project, the de facto
   bridge). Wraps every major provider and lets you call
   `client.chat.completions.create(response_model=MyPydanticModel)`.
   The library handles the schema export, the constraint, the
   re-prompt on validation failure, and returns a typed Python
   object. Took the schema-first pattern from "advanced" to
   "default" inside 18 months.

Simon Willison's coverage of OpenAI's structured outputs launch made the
distinction explicit: **JSON mode** guarantees the output parses as
JSON. **Structured Outputs** guarantees the output matches *your
shape*. Those are different things. JSON mode lets the model return
any JSON it wants. Structured Outputs lets the model return only the
JSON you defined.

## What the schema-first pattern looks like end-to-end

```python
# 1. Define the shape once.
class SupportTicket(BaseModel):
    customer_id: str
    severity: Literal["low", "medium", "high"]
    summary: str
    requires_human: bool

# 2. The prompt is short. The schema does the heavy lifting.
prompt = "Classify the support ticket below."

# 3. The provider is told to respect the schema (Anthropic example).
response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=[{
        "name": "classify_ticket",
        "input_schema": SupportTicket.model_json_schema(),
    }],
    tool_choice={"type": "tool", "name": "classify_ticket"},
    messages=[{"role": "user", "content": f"{prompt}\n\n{ticket_text}"}],
)

# 4. The validator is the customs officer at the boundary.
raw_args = response.content[0].input
ticket = SupportTicket.model_validate(raw_args)  # typed, validated, safe
```

Four lines do what 30 words of prompt-engineering used to do, and they
work on the first call instead of the 92nd. The schema is the
declaration. The validator is the enforcement.

## Why this is a strategic shift, not a tactical one

Prompts are stylistic. Two engineers writing the same JSON-extraction
prompt will produce two different prompts, and both will mostly work,
and both will fail differently. Prompts are also invisible to your
type system — they're strings in your code, and Cursor can't tell you
when they drift from what your downstream code expects.

Schemas are structural. The schema lives in your codebase as a class.
Your IDE knows about it. Your downstream code uses it (`Receipt(...)`
is a real type). Your linter checks usages. Your tests can construct
fixtures from it. The model is constrained by the same artifact your
own code consumes. **The schema is one source of truth.** The prompt
is one *attempt* at conveying that truth in prose.

When the schema changes, every consumer breaks at compile time
(roughly speaking — Python is dynamic, but mypy / Pyright + Pydantic
together get you 90% of the way there). When a prompt changes, you
find out at 3am that the model started returning a new field.

The takeaway, in one line:

> **Every word of a prompt that describes the output shape is a word
> the schema should be saying instead.**

If your prompt has "return JSON with the following fields…" in it,
delete that sentence and pass the schema to the provider directly.
The prompt should describe the *task* ("classify this ticket"), not
the *shape* ("return JSON with fields a, b, c"). The shape is the
schema's job.

Next: a quick check on where validation belongs in your architecture.
