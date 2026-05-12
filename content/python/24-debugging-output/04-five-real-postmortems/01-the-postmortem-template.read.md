---
xp: 1
estSeconds: 200
concept: postmortem-template
---

# Blame the system, not the model

The previous lesson gave you a four-class taxonomy. This lesson is
five cases — three of them public (Air Canada, DPD, NYC MyCity, which
made the news, the courts, or both) and two of them composites
synthesized from patterns we have seen across multiple enterprise
deployments (the recruiter JSON mangle in lesson 5 and the Glean-style
retrieval miss in lesson 6). The composite cases are flagged at the
top of each composite lesson so you know exactly which is which. You
will walk through them with the taxonomy in hand and notice the same
shape every time: the model did what it was told, and the system
around it failed.

This is the discipline that keeps you out of the news. Teams that
debug AI features well do not say "the model hallucinated" and ship a
patch to the prompt. They write a structured post-mortem, find the
seam in the system, and add an eval so the next instance of that class
gets caught by CI instead of a customer.

## The template

Every customer-visible AI failure deserves the same six-section
write-up. It takes about 20 minutes once you have the trace in hand.

1. **What shipped.** The feature, the model, the date it went live,
   the volume of traffic it sees. One paragraph. No vague language.
   "Our customer-facing refund-status chatbot, GPT-4o behind a RAG
   layer, went live November 12, handles ~4,000 sessions a day."

2. **What users saw.** The complaint, the screenshot, the
   reproduction steps. Quote the user. Do not paraphrase. Customer
   language often contains the seam: "told me my refund was
   processed" is class 1 or class 3 depending on the trace, never
   both.

3. **The trace.** The rendered prompt, the tools called, the chunks
   retrieved, the raw model output, the output after post-processing.
   Chapter 20 taught you to read these. This is where you read it.
   Paste the relevant fields. Do not summarize — the bug is usually
   in a field you would have summarized away.

4. **The root cause.** Which of the four breakage classes
   (1: retrieval gave wrong context, 2: prompt was ambiguous, 3: true
   hallucination, 4: downstream code mangled the output). Cite the
   field in the trace that proves it.

5. **The fix.** The change to the system that addresses the root
   cause at its layer. A class 1 fix is in the retriever. A class 4
   fix is in the post-processing code. **Never patch the prompt for a
   non-prompt bug.** This is the most common mistake teams make and
   it is why the same class of bug ships twice.

6. **The eval that catches it now.** This is the only section that
   matters six months from now. Every customer-visible failure is an
   eval gap — if your eval suite had caught it, the user wouldn't
   have. Write the test case. Add it to CI. The post-mortem is not
   closed until the eval runs green on the fix and red on the
   original bug.

## Why the template is rigid

Because the bias under pressure is to skip steps 3 and 6. Step 3
takes work — you have to actually read the trace, and traces are
ugly. Step 6 feels like overhead when the customer is already angry
and the prompt patch already shipped to staging.

Both shortcuts cost you the next bug. Without step 3, you
misclassify. Without step 6, you ship the same class of bug again.
Teams that do both — every time — get to the point where AI failures
shrink quarter over quarter. Teams that skip them get to the point
where the same complaint shows up three times in six months from
three different users.

## The five cases that follow

**Three are public**: Air Canada (case 1), DPD (case 2), NYC MyCity
(case 3). These made the news, the courts, or both.

**Two are composites**: the recruiter JSON mangle (case 4, lesson 5)
and the Glean-style enterprise-RAG retrieval miss (case 5, lesson 6).
These are synthesized from patterns seen across multiple enterprise
deployments rather than tied to a single named incident. Each
composite lesson opens with that disclosure — read it before you
treat the case as reportage.

The point of walking through them — real or composite — is not to
feel superior to the engineers who shipped them. Those engineers were
senior. The systems were not naive. The failures shipped because the
post-mortem template above either did not exist at those companies,
or it was treated as optional. By the end of this lesson you will be
able to look at any of them and name the class, the fix, and the
eval — fast, and without defending the model.
