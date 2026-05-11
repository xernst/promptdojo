---
xp: 2
estSeconds: 120
concept: trace-fields-by-class
code: |
  # which trace field points at which class.
  # this is the discipline: look at fields in priority order.

  def classify(trace):
      # 1. retrieval — did a retriever return obviously-wrong chunks?
      if trace["retrieved_chunks"] and trace["retrieved_chunks_match_query"] is False:
          return "retrieval"
      # 2. parse — did postprocessing change the output?
      if trace["raw_output"] != trace["output_after_postprocess"]:
          return "parse"
      # 3. hallucination — no retrieval but model confidently answered
      if not trace["retrieved_chunks"] and trace["model_confident"]:
          return "hallucination"
      # 4. prompt — fallback when context was clean but output is wrong
      return "prompt"

  trace = {
      "rendered_prompt": "Summarize the user's last 3 tickets.",
      "tools_called": ["search_tickets"],
      "retrieved_chunks": ["ticket_88", "ticket_92", "ticket_104"],
      "retrieved_chunks_match_query": True,
      "raw_output": '{"summary": "user reported 3 billing issues"}',
      "output_after_postprocess": '{"summary": "user reported 3 billing issues"}',
      "model_confident": True,
  }
  print(f"class: {classify(trace)}")
runnable: true
---

# Each class lives in a different trace field

You read a trace by knowing which fields point at which class. Not
every field is equally useful at every moment. Read them in
priority order.

## The trace shape

A real production trace has a lot of fields. The five that classify
a failure:

| Field | What it tells you |
|---|---|
| `retrieved_chunks` | What the retriever returned. Empty? Wrong? Right? |
| `rendered_prompt` | The exact prompt the model saw — variables substituted, system + user merged |
| `raw_output` | What the model literally returned, before any post-processing |
| `output_after_postprocess` | What your code did to the raw output before showing it to the user |
| `tools_called` | Which tools ran, in what order |

A trace without these fields is a trace you can't classify against.
If your logging only captures the final user-facing string, you're
flying blind — fix logging before you debug the next failure.

## Priority order: which field first

Read the fields in this order. Stop at the first one that points
at a class.

1. **Retrieved chunks**. Open them. Are they relevant to the
   question? Are they from the right account, customer, document,
   or time range? If `retrieved_chunks` looks wrong: **class 1
   (retrieval)**. Stop here.

2. **Rendered prompt**. Read it like a stranger would. Is the
   instruction ambiguous? Could a careful reader pick a different
   reasonable answer than the one you wanted? If yes: **class 2
   (prompt)**. Stop here.

3. **`raw_output` vs `output_after_postprocess`**. Are they
   different? Diff them. If post-processing changed something
   meaningful: **class 4 (parse)**. Stop here.

4. **None of the above**. The retriever was fine, the prompt was
   clear, your code didn't touch the output, and the answer is
   still wrong. That's **class 3 (hallucination)**. The model
   answered from priors when there was nothing to ground in.

## Why this order

Retrieval bugs are the most common in production and the easiest to
spot — the wrong chunk is right there in the log. Prompt bugs are
next most common and require slower reading. Parse bugs hide in the
diff between raw and post-processed. True hallucinations are the
*least* common cause of customer-visible failures, despite being
the most blamed. Most "the model hallucinated" reports are actually
class 1, 2, or 4 in disguise.

## What this lesson does NOT do

It does NOT teach you to *fix* any of these classes. Fixing
retrieval is chapter 22. Fixing prompts is chapter 19. Fixing parse
bugs is chapter 23. This lesson teaches the discipline of
**putting the failure in the right bucket** so you fix it at the
right layer. The wrong fix at the wrong layer is how teams burn
weeks on a bug.

## What you'll build

A `classify_failure(trace)` that reads the four key fields in
priority order and returns one of `"retrieval"`, `"prompt"`,
`"hallucination"`, or `"parse"`. That function becomes the front
door for every wrong-output ticket on your team.
