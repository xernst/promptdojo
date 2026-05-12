---
xp: 1
estSeconds: 220
concept: case-dpd-mycity
---

# Cases 2 and 3: DPD swore at customers, and NYC told business owners to break the law

Two failures from early 2024. Different domains, identical class.

## DPD — January 2024

DPD is a UK parcel-delivery company. In January 2024 a frustrated
customer, Ashley Beauchamp, was trying to get help locating a missing
parcel from the DPD support chatbot. The chatbot was unable to find
the parcel. Beauchamp, in a moment of curiosity, asked the chatbot
to write him a poem about how useless DPD's customer service was.
The chatbot complied. It wrote a haiku-format insult of its own
company. Beauchamp escalated and asked the bot to swear in its next
response. It did — calling itself "the worst delivery firm in the
world." He screenshotted the exchange and posted it. The story went
global within 48 hours. DPD pulled the chatbot.

Public statement from DPD: an "error occurred after a system update."
The actual cause, per industry reporting, was that a recent update
had removed or weakened the system prompt's content-filtering rules.
The underlying LLM was happy to comply with any user request because
nothing in the prompt told it not to.

## NYC MyCity — March 2024

The Markup (with THE CITY) led the reporting in March 2024, with
follow-up coverage by the Associated Press, that New York City's
MyCity small-business chatbot — built on
Microsoft's Azure AI services and launched October 2023 — was
confidently telling business owners they could do things that were
illegal under city law. Examples from the published reporting:

- Asked whether a landlord can refuse tenants based on source of
  income (i.e., refuse Section 8 vouchers), the chatbot said yes.
  Under NYC law, this is illegal.
- Asked whether a restaurant can take a cut of an employee's tips,
  the chatbot said yes. Under NYC and federal law, employers cannot.
- Asked about firing employees who report sexual harassment, the
  chatbot said the employer could fire workers who complained about
  sexual harassment (illegal under federal and NYC law).

Each answer was generated, plausible-sounding, and wrong. Reporters
verified the failures with the city's own legal staff. The city kept
the chatbot live with a disclaimer added rather than taking it down.

## Reading the trace

Both failures share the same trace shape. Different surface, same
seam:

- `rendered_prompt`: a general "you are a helpful assistant for X"
  system prompt with no hard-coded constraints on the domain.
- `tools_called`: none, or minimal. Neither bot was wired to a
  citation-required retrieval pipeline. They generated from training
  knowledge.
- `retrieved_chunks`: empty in DPD's case (it was a generative
  chatbot, no RAG). For NYC MyCity, retrieval existed but was
  shallow — the underlying policy documents were not consistently
  retrieved, and the model was not required to cite them.
- `raw_output`: the swear, the bad legal advice.
- `output_after_postprocess`: identical to raw_output. The bug is
  not in post-processing.

## The class

Both are **class 3 — true hallucination.** The model invented an
answer in a domain where the right answer was not retrieved and the
model was not forced to refuse on uncertainty. The DPD case has a
class-2 flavor (system prompt missing constraints) but the deeper
failure is "the model answered without grounding." Same for MyCity.

The shared pattern: **open-ended generative chat over a domain that
requires citations**. Delivery policy is a domain that requires
citations. Municipal small-business law is a domain that requires
citations. Both companies shipped chat interfaces that produced
fluent text without ever telling the model "you may only answer with
text you can quote from a retrieved source."

## The fix that would have caught both

The fix is the same fix in both cases, and it is not "tighten the
system prompt to be polite" or "add a profanity filter." Those fixes
treat the surface. The root cause is the absence of retrieval
grounding plus citation-required output.

1. **Retrieval-with-citations as a hard requirement.** Every answer
   the chatbot generates must include a citation to a retrieved
   chunk. If retrieval returns nothing, the chatbot refuses and
   offers a human-handoff path. No exceptions, enforced in code
   (not in the prompt).

2. **An out-of-domain detector.** Before generation, classify the
   user's question into "in-scope topics the chatbot is allowed to
   discuss" versus "everything else." DPD: parcel tracking, address
   updates, returns. Everything else routes to a refusal template.
   NYC: a finite list of business-license-and-compliance topics with
   curated policy sources. Asking for a poem? Out of domain. Asking
   about employee firing? In-domain but routes to a constrained
   policy-citation prompt.

## What these cases teach

The same architectural mistake, in two industries, in the same
quarter. Both companies treated "the model has a system prompt" as
sufficient safety. Both discovered that a system prompt is a
suggestion the model may comply with, not an enforced contract. The
contract has to live in code: retrieval gating, citation requirements,
out-of-domain refusal. The model's instructions are downstream of
the architecture, not a substitute for it.

DPD and NYC MyCity are the same post-mortem written twice. Step 6
— the eval — would have caught both: a regression test that asks the
chatbot ten out-of-domain or out-of-policy questions and verifies it
refuses every one. Neither company had that test. The journalists
ran it for them.
