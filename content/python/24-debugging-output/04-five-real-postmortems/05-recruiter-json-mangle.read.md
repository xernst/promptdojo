---
xp: 1
estSeconds: 200
concept: case-recruiter-json
---

# Case 4: The recruiter agent that texted email addresses

> **This case is a composite, not reportage.** It is synthesized from
> a class of failures observed across multiple internal agent rollouts
> in 2024 and 2025. There is no single named company behind it. The
> *failure mode* is the durable thing to learn from — the JSON
> parsed-but-mis-slotted shape — not the specific details.

A mid-sized recruiting firm rolled out an internal candidate-outreach
agent. The agent reads a candidate dossier (resume, prior contact
history, role they're being sourced for) and produces a structured
record for the downstream automation stack: a CRM update, a templated
SMS, and a templated email. The schema the model is asked to produce
looks roughly like this:

```
{
  "candidate_name": str,
  "candidate_email": str,
  "phone_number": str,
  "role_id": str,
  "sms_body": str,
  "email_body": str
}
```

A queue worker picks up the model's output, parses the JSON, and
fires two downstream sends: an SMS to `phone_number` and an email
to `candidate_email`.

## The incident

For about six hours one Tuesday, the recruiting team watched their
SMS deliverability dashboard plummet. The carrier was rejecting
roughly 40% of outbound texts. The on-call engineer pulled a sample
of failed sends and saw the destinations were strings like
`jane.doe@gmail.com` — being sent to an SMS endpoint. The carrier
correctly rejected them.

The candidates whose phone numbers *were* valid received their SMS,
but the message read: "Hi jane.doe@gmail.com, we have a role that
matches your background..."

The model had silently swapped the `candidate_email` value into the
`phone_number` slot. The JSON parsed cleanly — both fields had the
correct type (string) — and the downstream system, having no
validation beyond "is this a string," fired the sends.

## Reading the trace

- `rendered_prompt`: a detailed instruction asking for the structured
  record, with a JSON example showing the schema. No type
  constraints, no format constraints on phone vs email.
- `tools_called`: none. Pure LLM call.
- `retrieved_chunks`: the candidate's dossier, correctly retrieved.
- `raw_output`: a JSON object where the model had, on a subset of
  candidates whose dossiers had unusual phone-field formatting,
  flipped `candidate_email` and `phone_number`. The raw output was
  internally consistent — the email field also contained the phone
  number on those records.
- `output_after_postprocess`: the parser saw two strings, assigned
  them to the fields the JSON declared, and passed them through.

The interesting thing: the model was not making things up. The
candidate-email value in the phone-number slot was a real email
address — it just belonged in the *other* field. The model lost
track of which slot was which on a subset of malformed inputs.

## The class

This is **class 4 — downstream consumer assumes schema**. The model
produced JSON that parsed. The downstream code accepted any string
as a phone number. The contract between the agent and the consumer
was "the keys will be there" — but the consumer assumed something
stronger: "the values will match what the keys say they are."

A naive read calls this class 2 (the prompt didn't constrain the
output format enough). Reasonable. But the *fix* lives at the
boundary between the agent and the consumer, not in the prompt. A
better prompt reduces the rate of the bug; validation at the
boundary makes the bug structurally impossible to reach production.
That is the class-4 framing: trust no model output past a structural
check.

## The fix that would have caught it

**Pydantic (or equivalent) validation at the boundary.** The queue
worker should not accept the model's output as a `dict`. It should
parse it into a typed model with format constraints:

- `candidate_email` validated against an email regex (or a
  full-featured email-validator library).
- `phone_number` validated against an E.164 or local phone format.
- Validation failures route the record to a dead-letter queue with a
  human-review flag. They do *not* fire downstream sends.

The eval that catches this in CI is a property-style test: generate
200 candidate dossiers with adversarial phone/email formatting
(emails with digits, phones with letters, missing country codes,
international formats, unicode characters), run the agent over them,
and assert that no record exits with an email in a phone field or
vice versa. The records that fail validation are fine — they're
caught. The records that *pass* validation with the wrong values in
the wrong slots are the regression.

## What this case teaches

The model writing JSON is not a contract. It is a hopeful suggestion
that, on most inputs, matches your schema. Real systems treat agent
output as untrusted at the boundary — same as you would any user
input, any third-party API response, any external data. Pydantic
exists because Python systems have learned this lesson for every
other source of data. AI output is no different.

This is also the case where the post-mortem template's step 5 is
hardest to follow. The instinct is to "make the prompt clearer."
The class-4 fix moves the constraint into code, where the model can't
violate it. That move — from prompt to schema — is the single
biggest reliability improvement most teams can make in their first
quarter of running an agent in production.
