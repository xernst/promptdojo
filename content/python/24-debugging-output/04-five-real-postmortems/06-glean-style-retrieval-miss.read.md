---
xp: 1
estSeconds: 200
concept: case-retrieval-staleness
---

# Case 5: Enterprise RAG returned the wrong policy with full confidence

Unlike the prior four cases, this one is a composite — synthesized
from patterns seen in multiple enterprise-RAG deployments rather
than a single named incident. It draws from the enterprise-RAG
space — the category that includes Glean, Hebbia, Notion AI, and
the long tail of internal Confluence-on-top-of-RAG deployments. We
have seen this exact failure mode at multiple Fortune-500
deployments in 2024-2025. The shape is durable enough to teach from.

A 4,000-person company rolls out an internal knowledge-search agent.
Employees ask questions in natural language; the agent retrieves from
the company's Confluence, SharePoint, and Notion workspaces, then
generates an answer with cited sources. Adoption is high. People
start trusting it for HR questions, IT-policy questions, and
compliance questions.

Six weeks in, a senior compliance officer asks the bot: "What is our
policy on accepting client-side gifts under $100?" The bot answers,
confidently, with a citation: "Per the 2022 Gift Acceptance Policy
(Confluence: /policies/gifts-2022), gifts under $100 may be accepted
without disclosure." It includes a clean source link. The compliance
officer accepts a $80 gift from a vendor.

Two weeks later, internal audit flags the acceptance. The actual
current policy — the 2024 Gift Acceptance Policy, which lives at
`/policies/gifts-2024` — requires disclosure of *all* client-side
gifts regardless of value, following a settlement the company entered
in 2023. The 2022 policy was supposed to be archived. Nobody
archived it. The retriever pulled it, the model cited it correctly,
and the user trusted the citation because it looked legitimate.

## Reading the trace

- `rendered_prompt`: a standard RAG prompt: "Answer the user's
  question using only the retrieved chunks. Cite your sources."
- `tools_called`: `search_confluence`, `search_sharepoint`,
  `search_notion`.
- `retrieved_chunks`: top-3 chunks, all from the 2022 policy
  document. The 2024 policy was in Confluence but was at a different
  URL with different keyword density and lost the embedding-similarity
  ranking against the user's query. The 2022 doc, being older, had
  more inbound links and a higher relevance signal in the index.
- `raw_output`: a clear, well-cited answer drawing from the 2022
  policy.
- `output_after_postprocess`: identical to raw_output. The
  formatting was clean.

## The class

This is **class 1 — retrieval gave the wrong context**. The model
did exactly what it was asked: read the retrieved chunks and answer
with citation. The retriever handed it a chunk from a policy that
should have been archived. The model is innocent; the prompt is
innocent; the post-processing is innocent. The fix lives in the
retrieval and indexing layer.

This case is class 1's quintessential shape: **stale data passing as
current**. It is the most dangerous version of class 1 because the
citation gives the answer credibility the underlying data doesn't
deserve. The user sees a source link, clicks it (or doesn't), and
acts on the answer. The chatbot was working as designed. The
*data* was wrong.

## The fix that would have caught it

The fix has three pieces, in order of impact:

1. **Freshness metadata at index time.** Every chunk in the
   retrieval index carries `created_at`, `last_updated_at`, and a
   `superseded_by` field (nullable, points to the URL of the
   replacing document). When the 2024 policy was published, the
   2022 policy's chunks should have had `superseded_by` set to the
   2024 URL. The retriever then either filters those chunks out
   entirely, or surfaces them with a "this document was superseded
   on [date] by [link]" header that the model is required to
   propagate.

2. **Citation-with-date in the answer.** The model is required to
   include not just a source link but the source's last-updated date.
   "Per the Gift Acceptance Policy (last updated 2022-03-14)..." The
   compliance officer reading "2022" would have immediately flagged
   the answer as suspect. Date in the citation is the cheapest user
   defense against stale retrieval.

3. **An eval that asks "did the model cite a superseded document?"**
   For a known set of policy questions, the eval suite verifies that
   the cited source is the *current* version. This requires
   maintaining a small ground-truth mapping of "policy topic →
   current source URL" — typically 30 to 100 entries for a mid-size
   company's most-asked-about policies. The eval is cheap to
   maintain and catches the entire class of staleness regressions in
   CI.

## What this case teaches

Class 1 retrieval failures are not always "the wrong document with
similar words." Sometimes they are "the right document but the
*wrong version of the right document.*" Enterprise RAG systems with
years of accreted documents and inconsistent archival hygiene
generate this failure mode constantly. The fix is upstream of the
agent: data lifecycle management, freshness signals, and citation
discipline.

Notice that this case, like the others, has an eval that catches it.
Step 6 of the post-mortem template — "the eval that catches it now"
— is the through-line across all five cases. Air Canada needed an
eval for unauthorized commitments. DPD and NYC needed evals for
out-of-domain responses. The recruiter needed a schema-validation
eval. This case needs a stale-citation eval. **Different surface,
same medicine.**

You can probably guess where the next step is going.
