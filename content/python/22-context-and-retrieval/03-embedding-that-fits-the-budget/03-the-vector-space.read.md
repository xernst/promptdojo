---
xp: 2
estSeconds: 150
concept: cosine-similarity-intuition
code: |
  # cosine similarity = "do these two vectors point in the same direction?"
  # 1.0 = identical direction. 0.0 = perpendicular. -1.0 = opposite.
  # for embeddings, you almost always see values between 0 and 1.

  import math

  def cosine(a, b):
      dot = sum(x * y for x, y in zip(a, b))
      norm_a = math.sqrt(sum(x * x for x in a))
      norm_b = math.sqrt(sum(y * y for y in b))
      return dot / (norm_a * norm_b)

  # three faked embeddings. think of these as "where the meaning lives."
  query = [0.9, 0.1, 0.0, 0.0]  # "reset password"

  candidates = {
      "reset my password":            [0.85, 0.15, 0.05, 0.0],   # near twin
      "cancel my subscription":       [0.1, 0.9, 0.1, 0.0],      # totally different
      "I forgot my login credentials": [0.7, 0.3, 0.1, 0.05],    # related, not identical
  }

  for text, vec in candidates.items():
      score = cosine(query, vec)
      print(f"{score:.4f}  {text}")
runnable: true
---

# Cosine similarity in 60 seconds

You don't need linear algebra to use embeddings. You need one
function. It's called cosine similarity and it answers one question:

> Do these two vectors point in roughly the same direction?

That's it. Two pieces of text that mean similar things produce
vectors that point similar directions. Two unrelated pieces of
text produce vectors pointing different directions.

The formula is three lines of stdlib Python — run the editor.

## What the numbers mean

| Score | Interpretation |
|---|---|
| 1.0 | Identical direction (vectors of the same text) |
| 0.85–0.99 | Strong semantic match — usually a hit |
| 0.5–0.85 | Related topic, possibly the right chunk |
| 0.2–0.5 | Tangentially related — probably noise |
| Below 0.2 | Unrelated — definitely noise |

These ranges shift with the model. `text-embedding-3-small` tends
to give higher absolute scores than `voyage-3`. **Always look at
the relative order, not the absolute number.** The top-K matters,
the score is a sanity check.

## Why "cosine" and not regular distance?

Two reasons. First, embeddings have hundreds or thousands of
dimensions, and in high-dimensional space, *direction* carries
meaning while *magnitude* mostly carries length (more tokens →
bigger vector). You want direction.

Second, cosine is bounded — it's always between -1 and 1, so you
can compare scores across queries. Euclidean distance is unbounded
and depends on vector length.

## The pre-flight you have to remember

Cosine similarity assumes vectors are pointing **out from the
origin**. If one vector is at the origin (all zeros) the formula
divides by zero. In practice this means:

- Don't embed empty strings.
- Don't embed strings of only whitespace.
- Trim and validate your input before calling the API.

A surprising number of RAG bugs are "we embedded an empty string
once and now the index has a zero vector that matches every query
equally poorly."

## What you'll do next

Step 4: given three vectors and a query, predict which one is
closest. Step 5: fill in the cosine formula yourself. Step 6 and 7:
fix two bugs every junior engineer ships. Step 8: write the ranker.
Step 9: build a tiny FAQ search engine end-to-end.
