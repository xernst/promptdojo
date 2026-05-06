---
xp: 2
estSeconds: 100
concept: recursive-separator-fallback
code: |
  # the recursive splitter in 20 lines. exact pattern LangChain uses.

  SEPARATORS = ["\n\n", "\n", ". ", " ", ""]

  def recursive_split(text, max_chars, separators=SEPARATORS):
      # base case: text fits, return it as one chunk.
      if len(text) <= max_chars:
          return [text]

      # try each separator in priority order.
      for sep in separators:
          if sep == "":
              # last resort: hard cut every max_chars characters.
              return [text[i:i + max_chars] for i in range(0, len(text), max_chars)]

          if sep in text:
              parts = text.split(sep)
              # try to combine parts back into chunks <= max_chars.
              chunks = []
              current = ""
              for part in parts:
                  candidate = current + (sep if current else "") + part
                  if len(candidate) <= max_chars:
                      current = candidate
                  else:
                      if current:
                          chunks.append(current)
                      current = part
              if current:
                  chunks.append(current)
              # any chunk still too big? recurse with the next separator.
              result = []
              next_seps = separators[separators.index(sep) + 1:]
              for chunk in chunks:
                  if len(chunk) > max_chars:
                      result.extend(recursive_split(chunk, max_chars, next_seps))
                  else:
                      result.append(chunk)
              return result
      return [text]

  doc = "First paragraph here.\n\nSecond paragraph is longer and has more text in it."
  for c in recursive_split(doc, 40):
      print(repr(c))
---

# Recursive split, in priority order

The recursive splitter is the algorithm every framework's default
chunker uses. It looks complex; it isn't. Three rules:

## 1. The separators are an ordered list

```python
SEPARATORS = ["\n\n", "\n", ". ", " ", ""]
```

In English: try paragraph break first, then line break, then
sentence-end, then word, then character. Order = priority. Earlier
separators preserve more semantic meaning.

For code, the list changes:

```python
PYTHON_SEPARATORS = ["\nclass ", "\ndef ", "\n\n", "\n", " ", ""]
```

`class` and `def` boundaries beat paragraph breaks for Python files.
LangChain ships these per-language out of the box; LlamaIndex's
`CodeSplitter` does the same with tree-sitter parsing.

## 2. Try separators top-to-bottom; recurse on big chunks

The function:

1. Picks the highest-priority separator that exists in the text.
2. Splits and reassembles parts back into chunks ≤ `max_chars`.
3. Any chunk still too big after assembly → recurse on it with the
   *next* separator.

This means a long paragraph gets split into sentences. A long
sentence gets split into words. A pathologically long word (rare)
gets cut at character. Each cut is at the highest-priority
boundary that fits.

## 3. The empty-string separator is your safety net

```python
if sep == "":
    return [text[i:i + max_chars] for i in range(0, len(text), max_chars)]
```

If the text has no separators at all (one giant URL, a base64
blob, a runaway `ImportError` traceback), the function still
returns chunks of bounded size. Without the empty-string fallback,
a malformed document could produce one infinitely-long chunk that
overflows your token budget.

## What gets cut, and why it's better than naive

Take a markdown doc with a code block:

```
# Setup

Install with pip.

```python
import requests
response = requests.get(url)
```

Then read the response.
```

- **Naive char-count chunking** cuts every 80 chars regardless. The
  code block gets sliced mid-line. `import requests` ends up in
  one chunk; `response = requests.get(url)` ends up in another.
- **Recursive split** finds `\n\n` first and splits into 4 logical
  blocks: heading, install instruction, code block, follow-up. If
  any block is still too big, it falls to `\n`, then `. `. The
  code block stays whole.

The query *"show me the request example"* now retrieves the *whole*
code block. The model sees both lines. The answer is correct.

## What this lesson does NOT cover

Two things real production chunkers do that we're skipping for
brevity:

1. **Token-aware budgets.** Real chunkers count tokens (via
   `tiktoken` for OpenAI, Anthropic's `count_tokens` API for
   Claude), not characters. Embedding models charge per token, so
   "max 500 tokens per chunk" is the right unit. We use chars
   because Pyodide doesn't have these libraries.
2. **Markdown/HTML/code AST parsing.** LangChain's
   `MarkdownTextSplitter` parses headings into a tree and chunks
   *within* sections. Reducto and Unstructured do the same for
   PDFs. The recursive char splitter is the floor; AST-aware
   chunking is the ceiling.

What you'll build is the floor. Once you have it, replacing the
character count with token count is a one-line change, and
swapping in an AST parser is the next step.
