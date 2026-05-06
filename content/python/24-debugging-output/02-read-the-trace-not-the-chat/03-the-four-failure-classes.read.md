---
xp: 2
estSeconds: 100
concept: failure-class-taxonomy
code: |
  # four failure classes. each has a different fix layer.

  CLASSES = {
      "retrieval":          "Tool/RAG returned wrong or missing data.",
      "prompt":             "Model interpreted instructions wrong.",
      "true_hallucination": "No tool ran; model invented from nothing.",
      "downstream_mangling": "Trace fine; post-processing broke the output.",
  }

  FIXES = {
      "retrieval":          "Fix the retriever — chunking, top-k, embedding model.",
      "prompt":             "Fix the prompt — clearer instructions, few-shot example.",
      "true_hallucination": "Constrain output — schema, citations, refuse on uncertainty.",
      "downstream_mangling": "Fix the JSON parse / regex / display layer.",
  }

  for name in CLASSES:
      print(f"{name}: {CLASSES[name]}")
      print(f"  fix: {FIXES[name]}")
---

# The four classes, by where the bug lives

Every broken AI output belongs to exactly one of these classes. The
fix layer is *different* for each. Confusing them produces the
classic "we shipped a fix that didn't fix anything" rotation.

## 1. Retrieval

The agent called a tool, the tool returned wrong or missing data,
the model passed it on. The classic case: a RAG retriever pulls the
top-3 chunks but the right chunk is chunk 4. The model's prompt
includes irrelevant context. The model does its best and produces a
confident wrong answer.

**Trace signature**: `tools_called` shows a search/retrieval tool;
the tool's response (in the user-role tool_result) is the bad data.

**Fix layer**: the retriever. Re-chunk the source. Increase top-k.
Switch embedding models. The prompt and the model are innocent.

## 2. Prompt

The model got correct context and clear input, but interpreted the
instructions wrong. The agent was told to "extract the invoice
total" and instead returned the line-item total. The model wasn't
hallucinating — it was reading your prompt and answering the
question your prompt actually asked.

**Trace signature**: tools_called is empty or returned correct data;
the model's answer doesn't match user intent.

**Fix layer**: the prompt. Add a constraint, an example, a negative
case ("not the line-item total — the invoice total"). The model and
the retriever are innocent.

## 3. True hallucination

No tool ran. No retrieval happened. The model just made it up. The
classic case: a chat without grounding tools, the model is asked
about a recent event past its training cutoff, and confidently
fabricates.

**Trace signature**: `tools_called` is empty across all turns; the
answer references facts the model couldn't verify.

**Fix layer**: constrain output. Force tool use ("you MUST search
before answering"). Require citations. Refuse on uncertainty.

## 4. Downstream mangling

The trace is FINE. The model returned a correct, well-formed
answer. Then your code mangled it. JSON parse stripped a field. A
regex post-processor ate a backtick. The frontend HTML-escaped a
quote. The bug isn't AI — the bug is the boring code between the
model and the user.

**Trace signature**: trace looks healthy; output as logged matches
expected; what the user sees doesn't.

**Fix layer**: post-processing code. The model is innocent. The
retriever is innocent. The prompt is innocent.

## Why the classification matters

The fix layer ≠ the symptom layer. A user-visible JSON parse error
might be:

- **Class 1 (retrieval)** if a tool returned malformed JSON
- **Class 2 (prompt)** if the model wasn't told what shape to return
- **Class 3 (hallucination)** if the model invented a structure
- **Class 4 (mangling)** if your code dropped a closing brace

Same symptom, four different fixes. The trace is what tells you
which class — and adding the wrong fix doesn't help.

## What this lesson does NOT cover

Tool-loop bugs (where the model calls the same tool 5 times in a
row) are their own class. They show up as a `tools_called` pattern
in the trace, not as a wrong-answer in the output. We're scoping
this lesson to the four output-failure classes; tool loops are a
separate skill.
