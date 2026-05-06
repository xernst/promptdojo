---
xp: 2
estSeconds: 100
concept: four-cache-breakpoints
code: |
  # the canonical Anthropic cache layout — 4 breakpoints, variable last.

  request = {
      "system": [
          {"type": "text", "text": "You are a helpful assistant.",
           "cache_control": {"type": "ephemeral"}},          # breakpoint 1
      ],
      "tools": [
          {"name": "search", "description": "...", "input_schema": {}},
          {"name": "read",   "description": "...", "input_schema": {},
           "cache_control": {"type": "ephemeral"}},          # breakpoint 2
      ],
      "messages": [
          {"role": "user", "content": [
              {"type": "text", "text": "[FEW SHOT EXAMPLES]",
               "cache_control": {"type": "ephemeral"}},      # breakpoint 3
              {"type": "text", "text": "[USER QUESTION HERE]"}, # variable, NO cache_control
          ]},
      ],
  }

  # count breakpoints
  breakpoints = 0
  for block in request["system"]:
      if "cache_control" in block: breakpoints += 1
  for tool in request["tools"]:
      if "cache_control" in tool: breakpoints += 1
  for msg in request["messages"]:
      for block in msg["content"]:
          if "cache_control" in block: breakpoints += 1

  print(f"breakpoints: {breakpoints} of 4 max")
---

# Four breakpoints, variable last

Anthropic's prompt caching API lets you place up to **4 cache
breakpoints** per request. Each breakpoint says "everything up to
this point is stable; cache it as a prefix." The model API hashes
the prefix and reuses it on subsequent calls.

The canonical layout for an agent:

| Breakpoint | What's before it | Why cache here |
|---|---|---|
| 1 | System prompt | Almost never changes. Highest hit rate. |
| 2 | Tool definitions | Stable across deploys; ~500–2000 tokens. |
| 3 | Few-shot examples | Stable for a session or a release. |
| 4 | (often unused) | Optional — for multi-turn conversation history. |

Then the variable content (user question) goes AFTER the last
breakpoint. The cache fires on the stable prefix; the variable
suffix is paid full-price every call.

## Why 4 and not unlimited

Each breakpoint costs API overhead. 4 is enough to cache the four
big stable layers in a typical agent (system, tools, examples,
history). More than 4 buys you nothing because most prompts don't
have 5 distinct stable layers.

A common waste: putting `cache_control` on every text block. The
API silently uses only the *last 4*. The early ones are no-ops.

## The TTL economics

Two TTL options, very different prices:

| TTL | Write cost | Read cost | Use when |
|---|---|---|---|
| `5m` (default) | 1.25× input | 0.1× input | Sub-5-minute sessions; high call volume per session |
| `1h` | 2× input | 0.1× input | Long-running agents; sessions over 5 min |

The 1-hour cache costs 60% more to *write* but doesn't expire
mid-conversation. For an agent loop that takes 10 minutes per
session, the 5-minute cache fires once at the start, expires
mid-session, and you pay full input price for the second half.
Use 1h.

The default-default trap: prior to March 2026 the default TTL was
1 hour. Anthropic changed it to 5 minutes. Code that omits `ttl`
now silently uses 5m and quietly overspends on long sessions.
**Always set `ttl` explicitly.**

## The cache-busting bug, illustrated

```python
# WRONG — variable input first, breaks cache prefix.
messages = [{"role": "user", "content": [
    {"type": "text", "text": user_question},                # varies → no prefix shared
    {"type": "text", "text": LONG_FEW_SHOT_EXAMPLES,
     "cache_control": {"type": "ephemeral"}},               # too late; never cached
]}]

# RIGHT — stable first, variable last.
messages = [{"role": "user", "content": [
    {"type": "text", "text": LONG_FEW_SHOT_EXAMPLES,
     "cache_control": {"type": "ephemeral"}},               # stable; cached as prefix
    {"type": "text", "text": user_question},                # varies; full price (correctly)
]}]
```

This is the bug. Once you see it, you spot it immediately. Before
you've seen it, you'll ship it.

## What we're NOT covering

OpenAI's automatic caching kicks in on prompts >1024 tokens with
no opt-in. The trade-off: less control, no per-block breakpoints.
For most use cases it Just Works; for fine-grained control you'd
use Anthropic. Vercel's AI SDK passes through to whichever provider
you're targeting. Google Gemini has its own `cached_content` API
with similar shape. The principle (stable prefix, variable suffix)
is universal.
