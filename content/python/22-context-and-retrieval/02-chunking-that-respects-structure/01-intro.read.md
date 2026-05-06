---
xp: 1
estSeconds: 120
concept: structure-aware-chunking
code: |
  # naive: cut every N characters. fast, simple, destroys structure.
  def chunk_by_chars(text, size=80):
      return [text[i:i + size] for i in range(0, len(text), size)]

  doc = """# Setup

  Install the package with pip.

  ```python
  import requests
  response = requests.get(url)
  ```

  Then read the response."""

  for i, chunk in enumerate(chunk_by_chars(doc, 80), start=1):
      print(f"--- chunk {i} ---")
      print(chunk)
runnable: true
---

# Chunking is the boring part that makes or breaks RAG

Most "RAG tutorials" you'll read open with FAISS, embeddings, and a
30-line script that retrieves the top-3 nearest neighbors. Then they
declare victory.

The companies that ship RAG into production spend most of their RAG
work on the boring step that comes before all that: **how do you
cut the document into pieces in the first place?**

A document gets chunked once. The chunks get embedded once. The
embeddings sit in a vector store. Every user query retrieves chunks
that *exist* — meaning whatever bug you bake in at chunk time, you
inherit forever, on every query, until you rebuild the index.

Run the editor. The naive `chunk_by_chars` splits a markdown doc
every 80 characters. Look at where the cuts land. The code block is
torn apart mid-line. The sentence "Then read the response" gets
sliced. When the user later asks "show me the request example,"
retrieval may pull the chunk with `import requests` but miss the
chunk with `response = requests.get(url)` — because they're now in
*different chunks*. The model gets half the example.

That's the bug. The fix is structure-aware chunking.

## The hierarchy real splitters use

Production chunkers don't cut by character count. They cut by
**document structure first**, falling back to character count only
as the last resort. The canonical pattern (LangChain calls it the
`RecursiveCharacterTextSplitter`):

1. Try to split on **paragraph breaks** (`\n\n`). Stop if all
   resulting chunks fit your size budget.
2. If a chunk is still too big, split it on **sentence breaks**
   (`. ` or `\n`).
3. If a chunk is *still* too big, split on **word boundaries**
   (` `).
4. As a last resort, cut at the character boundary.

The win: most chunks land at natural boundaries (paragraph,
sentence). Only pathologically long sentences get cut mid-word, and
even those get an *intentional* word boundary instead of a random
character.

## What everyone calls it

| Framework | Primitive |
|---|---|
| **LangChain** | `RecursiveCharacterTextSplitter`, `MarkdownTextSplitter`, `PythonCodeTextSplitter` |
| **LlamaIndex** | `SentenceSplitter`, `MarkdownNodeParser`, `CodeSplitter` |
| **Chunking-as-a-service** | Reducto (`reducto.ai`), Unstructured (`unstructured.io`) — paid APIs that do *much* better on PDFs and tables |
| **Anthropic** | "Contextual Retrieval" (anthropic.com/news/contextual-retrieval, 2024) — adds chunk-level context with a model call before embedding |

The free OSS chunkers cover 80% of cases. The paid services cover
the cases the OSS chunkers shred — PDFs with tables, scanned
documents, mixed-language text.

## The second concept: chunk overlap

Even with structure-aware splitting, a fact often sits *across* a
chunk boundary. "Acme was founded in 1958. The company makes
running shoes." If those two sentences end up in adjacent chunks,
a query about "what does Acme make" might retrieve only the first
chunk and miss the second.

Production splitters fix this with **chunk overlap**: the last N
characters of chunk K become the first N characters of chunk K+1.
Some redundancy in storage, much higher recall on queries that
straddle boundaries. Default overlap: 10–20% of chunk size.

## What you'll build

A `recursive_split(text, max_chars, overlap)` that splits on
paragraph → sentence → word → char (in that priority order), with
chunk overlap baked in. Then a fix for the mid-sentence cut bug.
Then a fix for the missing-overlap bug. Then the full version that
takes a separator priority list and applies them recursively.
