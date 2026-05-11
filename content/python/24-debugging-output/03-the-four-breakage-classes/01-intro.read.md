---
xp: 1
estSeconds: 130
concept: four-classes-taxonomy
code: |
  # a fake trace string and a stub classifier.
  # the real classifier reads structured trace fields. this one
  # pattern-matches on keywords just to show the four classes.

  def classify_failure(trace_text):
      t = trace_text.lower()
      if "retrieved_chunks: []" in t or "wrong account" in t:
          return "retrieval"
      if "ambiguous instruction" in t or "interpreted as" in t:
          return "prompt"
      if "no tools called" in t and "confidently answered" in t:
          return "hallucination"
      if "raw_output ok" in t and "post_processed differs" in t:
          return "parse"
      return "unknown"

  traces = [
      "retrieved_chunks: [ticket_id=84211 from wrong account]; model answered from it",
      "rendered_prompt had ambiguous instruction; interpreted as line-item total",
      "no tools called; retrieved_chunks: []; model confidently answered with a fake date",
      "tools_called: [search]; raw_output ok; post_processed differs from raw_output",
  ]

  for t in traces:
      print(f"{classify_failure(t):14} <- {t[:60]}...")
runnable: true
---

# Four classes. Not five. Not seven. Four.

You shipped an AI feature. A user-visible failure landed in the
support inbox. You opened the trace. Now what?

Before you change a line of prompt or rebuild a retriever, sort the
failure into one of these four buckets. Every wrong-output failure
fits in exactly one. Pick the wrong bucket and you spend three days
fixing the wrong layer.

The previous lesson taught you to read traces. This one teaches you
the taxonomy you apply once you've read them.

## Class 1: Retrieval gave wrong context

The model dutifully answered from bad data. The retriever pulled a
chunk, a ticket, a document — and it was the wrong one. The model
treated it as gospel and produced a confident, wrong answer.

> Real-world example: the chatbot told a customer their refund was
> processed when it wasn't. The retriever pulled a ticket from a
> different account with a similar customer name, and the model
> read it and answered.

The model is innocent. The prompt is innocent. The fix is in the
retriever — chunking, top-k, embedding model, filter logic.

## Class 2: Prompt was ambiguous

The model got correct context and clear input. It just read your
instructions and picked an obvious-but-wrong interpretation. Your
prompt said "extract the total" and the invoice had three totals.
The model picked one. It wasn't the one you meant.

> Real-world example: a summarizer was told "give me the highlights"
> and returned a 12-bullet list when the dashboard had room for 3.
> The prompt never said "exactly 3 bullets."

The model is innocent. The retriever is innocent. The fix is in the
prompt — a clearer constraint, an example, a negative case.

## Class 3: True hallucination

No tool ran. No retrieval happened. The model just made it up. The
right answer wasn't available — either the data wasn't retrieved,
or the retriever returned nothing, or the question was outside the
agent's grounding. The model confidently fabricated.

> Real-world example: an internal tool was asked "when did we sign
> the Acme contract?" The retriever returned zero matching chunks.
> The model invented a date. The legal team noticed.

The fix is to constrain output — force tool use, require citations,
refuse on uncertainty. Don't try to "make the model less prone to
hallucinating." Stop letting it answer with no evidence.

## Class 4: Downstream code mangled the output

The model was right. Your code broke it. A JSON parser dropped a
field. A regex stripped a backtick. A frontend HTML-escaped a quote
into `&quot;`. The trace shows a clean raw output; what the user
sees is mangled.

> Real-world example: the model returned `{"refund": "$48.20"}`. A
> regex that "cleaned currency strings" matched the dollar sign and
> deleted it. The user saw `48.20` with no unit and called support
> asking what currency that was.

The model is innocent. The retriever is innocent. The prompt is
innocent. The fix is in the post-processing code.

## Why the taxonomy matters

Each class has a different fix layer. Misclassify the failure and
you ship a prompt change for a parse bug, or a retriever rebuild
for an ambiguous prompt. The fix that lands at the wrong layer
doesn't help — and worse, it teaches the team that "the bug is
fixed" when it isn't, so the same class of failure ships again
next month.

Run the editor. The stub `classify_failure` pattern-matches on
keywords for demo purposes. The real classifier you'll build later
reads structured trace fields — that's the next step.
