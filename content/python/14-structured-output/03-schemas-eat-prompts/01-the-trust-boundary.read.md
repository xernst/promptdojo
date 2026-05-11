---
xp: 1
estSeconds: 220
concept: trust-boundary
---

# The model output is foreign currency — inspect it at the border

Lessons 01 and 02 of this chapter taught you the mechanics. Define a
schema. Parse the JSON. Validate the shape. Catch `ValidationError`
narrowly. That's the toolkit. This lesson is the **mental model** that
makes the toolkit non-negotiable.

The model is not part of your system. It is a foreign system. It runs
on hardware you don't control, with weights you didn't train, returning
text shaped by a probabilistic process you can't audit. When its
output crosses into your code, that is a **trust boundary** — the same
kind of boundary that exists between your backend and a third-party
API, between a browser form and a server, between a Postgres database
and the application reading from it.

At every trust boundary in computing, there is a customs officer.
Forms get filled out. Manifests get checked. Anything that doesn't
match the declared shape gets stopped before it spreads.

The customs officer at the LLM-to-your-code boundary is the schema.

## Why "schema" beats "prompt" at the boundary

A prompt is a polite request to the model. "Please return JSON with a
name field and an age field." The model usually complies. Sometimes
it adds a `notes` field you didn't ask for. Sometimes it drops the
`age` field. Sometimes it returns `age` as a string. Sometimes it
wraps the JSON in `"Sure! Here's the JSON: { ... }"`.

A schema is a contract enforced on **both sides** of the boundary:

- **The model side**: providers now expose schema-aware modes
  (Anthropic tool-use with `input_schema`, OpenAI Structured Outputs
  with `response_format={"type": "json_schema", ...}`, the
  `instructor` library wrapping every major SDK). These modes
  constrain the model's decoding so the output is guaranteed to
  match the schema before it ever leaves the provider.
- **Your side**: Pydantic validates the response when it crosses
  into your process. If the schema-aware mode failed (or you didn't
  use one), the validator raises `ValidationError` and your
  downstream code never runs on a bad payload.

The polite request is gone. There is no prompt asking nicely. There
is a contract, and at the border, every package gets opened.

## The customs declaration analogy, formalized

```
+---------------------+              +-------------------+
|                     |  <-- prompt  |                   |
|  Your application   |              |   The model       |
|  (trusted)          |   response   |   (foreign)       |
|                     |  ----------> |                   |
+---------------------+              +-------------------+
                       ^
                       |
                  CUSTOMS OFFICER
                  (schema + validator)
                  - Inspects every response
                  - Rejects malformed shapes
                  - Returns typed objects to the inside
                  - Sends ValidationError back outside
```

The customs officer has three jobs:

1. **Read the manifest.** The schema declares what fields are
   required, what types they must be, what enum values are allowed,
   what ranges are valid.
2. **Inspect every package.** Every model response goes through the
   validator. Not the ones you remember to check — all of them.
3. **Reject early.** Rejection happens at the boundary, not three
   call-stack frames later when your code finally trips over a
   `None` it didn't expect.

If you skip the customs officer, what spreads through your system is
*unverified foreign data*. It looks like a Python dict, but it has the
informational status of a string you got off the internet. Every
function that touches it has to either re-validate (everyone forgets
to) or assume the model didn't lie this time (everyone does).

## What this lesson is about

Three things, in order:

1. Three real, shipped failures where engineers trusted the model
   instead of the boundary.
2. Why "write a longer prompt" loses to "write a tighter schema"
   in 2026.
3. The migration scar tissue — Pydantic v1 to v2 — that taught the
   community where validation belongs (boundaries, not everywhere).

By the end you'll write `audit_boundaries(system)` — a function that
scores any system on whether it actually has a customs officer at
every trust boundary, or whether it's running on faith.

Press *Next* and we'll start with the breakages.
