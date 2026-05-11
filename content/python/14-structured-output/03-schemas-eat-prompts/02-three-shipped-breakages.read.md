---
xp: 1
estSeconds: 220
concept: shipped-breakages-from-missing-boundaries
---

# Three real breakages — what happens when nobody mans the border

The schema-at-the-boundary pattern sounds abstract until you see the
bills. Here are three shipped failures from production AI features in
the last 18 months. Names changed. Symptoms identical.

## Breakage 1: The receipt extractor that swapped fields

A small-business expense app uses Claude to extract vendor and amount
from a photographed receipt. Schema (in the developer's head, not in
code):

```python
{
    "vendor": "string",
    "amount": "float (USD)",
}
```

The team prompted the model carefully: *Return only valid JSON with
`vendor` and `amount`.* In dev, on 50 test receipts, it always worked.

In prod, on a Saturday morning, the model started returning:

```json
{"vendor": "12.99", "amount": "Whole Foods Market"}
```

The fields were swapped. The downstream code took whatever was in
`amount`, parsed it as a float (failed silently on the string), fell
through to a `try/except`, and **charged the customer's stored card
the value in `vendor` — except that value was now the vendor name,
which the `float()` had thrown a `ValueError` on, which the catch-all
handler interpreted as "use the last successful amount."**

Customers got charged the wrong amount. Some got charged twice. The
support queue exploded. Two engineers spent a weekend rolling back.

What would have stopped it: a schema-aware extraction mode plus a
Pydantic validator at the boundary. The moment the model returned
`vendor` as a numeric-looking string and `amount` as text, the
validator would have raised `ValidationError` and the charge would
never have been attempted.

> **Cost**: ~$40k in refunds and ~$15k in support hours. **Root cause
> in the postmortem**: "No validation between model response and
> billing code." Translation: no customs officer at the boundary.

## Breakage 2: The ticket router that hallucinated an enum

A B2B SaaS company built an agent to route inbound support tickets to
the right team. The agent classified each ticket with a `priority`
field. The intended values were `low`, `medium`, `high`.

Pager rules: anything with `priority="high"` woke the on-call
engineer. The team did *not* define `critical` as a valid value. They
just didn't pager-page on it, because it didn't exist.

The model, in production, started occasionally returning
`priority="critical"` on tickets that were unusually angry.
Downstream code did a string-equality check against `"high"`,
correctly skipped the pager — but the **support dashboard counted
`critical` as `high` for SLA purposes**, marking thousands of tickets
as breached, triggering automated refund emails to customers whose
tickets were actually fine.

What would have stopped it: a Pydantic `Literal["low", "medium", "high"]`
or an `Enum`. The model would not have been able to return `critical`
under a schema-aware mode; if it had under a non-enforced mode, the
validator would have rejected the response on arrival.

> **Cost**: ~120 wrongly-issued refund emails, ~30 angry customer
> calls. **Root cause**: "Free-string priority field, no enum
> validation at the API boundary."

## Breakage 3: The eval harness that lost ground truth

An ML team built an eval harness to score Claude's answers to
customer-service questions. The expected-answer field was typed
loosely: `expected: str`. They scored the model's output with a
string-equality check against `expected`.

The expected answers came from a CSV. A junior engineer accidentally
saved one row with the answer wrapped in a list:

```
expected
"yes"
"no"
["yes"]
```

The CSV parser loaded `["yes"]` as the literal string `'["yes"]'`.
The model returned `"yes"`. String equality returned `False`. The
eval scored that case as a regression — even though the model was
right. A week of "the model got worse" debugging followed. The team
rolled back a perfectly fine prompt change to fix a problem that
wasn't there.

What would have stopped it: a schema on the eval CSV itself. The
expected-answer field, defined as `str` with a Pydantic validator,
would have rejected the `["yes"]` row on ingest. The harness would
have refused to run with bad ground truth.

> **Cost**: 6 engineer-days of false-alarm debugging, one good prompt
> change reverted for no reason. **Root cause**: "No schema
> validation on eval inputs."

## The pattern across all three

| Breakage | Trust boundary that wasn't guarded |
|---|---|
| Receipt swap | Model output → billing logic |
| Ticket pager | Model output → dashboard SLA logic |
| Eval CSV     | File input → eval scoring logic |

Every one of these would have been caught — in seconds, on the first
bad input — if the boundary had a schema and a validator on it. In
all three cases, the team had Pydantic in their codebase. They just
didn't put it where the foreign data came in.

That's the lesson worth memorizing. The presence of Pydantic in
`requirements.txt` doesn't protect you. **A schema at every boundary
where untrusted data enters** is what protects you.

Next: a quick check that you can distinguish a boundary failure from
a logic failure.
