---
xp: 1
estSeconds: 130
concept: embedding-cost-vs-quality
code: |
  # an embedding is a list of numbers that captures meaning. similar
  # text → similar numbers. we'll fake the real API call here — pyodide
  # can't reach OpenAI, but the SHAPE is identical to the real thing.

  def embed(text):
      # fake 8-dim embedding. deterministic. real call returns 1536 or 3072 floats.
      return [(hash(text + str(i)) % 1000) / 1000 for i in range(8)]

  for phrase in ["cancel my subscription", "how do I unsubscribe", "today's weather"]:
      vec = embed(phrase)
      preview = [round(x, 3) for x in vec[:4]]
      print(f"{phrase!r:35} -> {preview}... (8 dims)")
runnable: true
---

# Embedding is where the bill starts

Chunking is one-time work. Embedding is the cost that scales with
your corpus AND with your traffic — every chunk gets embedded once,
every user query gets embedded on every request. Pick the wrong
model and a side project that should cost $4/month costs $400.

Run the editor. We're faking the API with a stub `embed()` so this
runs in your browser. The real call is one line of code:

```python
# real version — needs an OpenAI key, doesn't run here.
from openai import OpenAI
client = OpenAI()
vec = client.embeddings.create(
    model="text-embedding-3-small",
    input="cancel my subscription",
).data[0].embedding  # list of 1536 floats
```

Same shape: text in, list of floats out. The numbers mean nothing
to you. They mean "where this text sits in semantic space" to a
vector database.

## The cost table that actually matters

| Model | Dims | Cost per 1M tokens | Where it shines |
|---|---|---|---|
| `text-embedding-3-small` (OpenAI) | 1536 | **$0.02** | Default. 95% of use cases. |
| `text-embedding-3-large` (OpenAI) | 3072 | $0.13 | Hard retrieval (legal, code, multilingual). 6.5× the cost. |
| `voyage-3` (Voyage AI) | 1024 | $0.06 | Highest benchmark scores on MTEB. |
| `all-MiniLM-L6-v2` (sentence-transformers) | 384 | **$0 (local)** | Free if you run it yourself. Slower at query time. |
| `cohere-embed-v3` | 1024 | $0.10 | Strong on long documents. |

That is roughly the entire embedding market. The interesting line
is the first one: `text-embedding-3-small` at **$0.02 per million
tokens** is the default you should reach for first. A chunk of 200
tokens costs $0.000004 to embed. A 10,000-chunk corpus costs **4
cents** to embed end-to-end.

## The rule of thumb

- **Corpus under 100k chunks, English, general topics**:
  `text-embedding-3-small`. Done. Move on.
- **Specialized domain** (legal, medical, code, non-English):
  start with `text-embedding-3-small`, build a 50-question eval
  set (see chapter 21), measure retrieval accuracy. Only upgrade
  to `large` if you're below 80%.
- **Privacy-sensitive or air-gapped**: `all-MiniLM-L6-v2` running
  locally via sentence-transformers. Free, no data leaves your box.
- **Massive corpus** (10M+ chunks): the $0.02 vs $0.13 gap becomes
  real money. Use `small` unless your eval set proves you need more.

## The mistake nobody catches

The trap that bites every team: **you must embed your documents
and your queries with the same model**. If you embed 10k chunks
with `text-embedding-3-small` and then a junior engineer embeds the
user query with `text-embedding-3-large`, the vectors aren't in the
same space. Cosine similarity returns garbage. Retrieval picks
random chunks. The model gets fed nonsense. You get a Slack message
about "RAG hallucinating again."

Step 6 is exactly this bug. You'll fix it.

## What you'll build

A tiny similarity engine using cosine math by hand (Pyodide has no
numpy in the default kernel, so we use stdlib). By the end you've
got `rank_by_similarity(query_vec, doc_vecs)` and a 5-FAQ retrieval
pipeline that returns the top-2 closest matches to a question.
