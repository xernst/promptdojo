---
xp: 1
estSeconds: 120
concept: prompt-caching-cost-economics
code: |
  # the cache pricing math, deterministic.
  # Anthropic: 1.25× input price to WRITE the cache (5-min TTL),
  #            0.1×  input price to READ from the cache.

  INPUT_RATE      = 3.0   # mock: $3 per 1M tokens
  CACHE_WRITE_X   = 1.25  # 1.25× input rate
  CACHE_READ_X    = 0.1   # 0.1× input rate

  def cost_uncached(tokens, calls):
      return INPUT_RATE * tokens * calls / 1_000_000

  def cost_cached(stable_tokens, variable_tokens, calls):
      # first call writes the cache; subsequent calls read it.
      write_cost  = INPUT_RATE * CACHE_WRITE_X * stable_tokens / 1_000_000
      read_cost   = INPUT_RATE * CACHE_READ_X  * stable_tokens * (calls - 1) / 1_000_000
      var_cost    = INPUT_RATE * variable_tokens * calls / 1_000_000
      return write_cost + read_cost + var_cost

  STABLE = 8000   # system prompt + tools + examples — same every call
  VAR    = 200    # the user's question — different every call
  CALLS  = 100

  print(f"uncached:   ${cost_uncached(STABLE + VAR, CALLS):.2f}")
  print(f"cached:     ${cost_cached(STABLE, VAR, CALLS):.2f}")
  print(f"saved:      ${cost_uncached(STABLE + VAR, CALLS) - cost_cached(STABLE, VAR, CALLS):.2f}")
runnable: true
---

# Caching only works if you put the variable input LAST

Prompt caching is the single most-leveraged cost optimization for
agent workloads, and the most-mis-implemented. The math is simple:
a 5-minute prompt cache reads at 0.1× the input price. If your
agent's system prompt + tools + examples are 8000 tokens and the
user input is 200 tokens, every call after the first reads 8000
cached tokens for the price of 800 fresh ones — **a ~10× cost
reduction on the stable portion.**

That's the math. The bug is that many production agents *destroy
their own cache on every call* by putting variable content at the
start of the prompt.

## Why position matters

The cache is a *prefix* match. The model API hashes your messages
in order. The cache hits on the longest common prefix between this
call and the previous one.

So if your prompt is:

```
[user question — varies] + [system context — stable]
```

the prefix is `user question`, which varies, which means **no
prefix is shared between calls**. Cache hit rate: 0. Cost: full
input price every call. The cache *exists* but never fires.

The fix is to invert:

```
[system + tools + examples — stable] + [user question — varies]
```

Now the prefix is your stable content. The cache fires on every
call after the first. Cost drops by ~10× on the stable portion.

This is the bug step 6 fixes. It's so common Anthropic's caching
docs lead with it: *"Place static content (tool definitions, system
instructions, examples) at the beginning of your prompt."*

## The four cache breakpoints

Anthropic's caching API lets you mark up to **4 cache breakpoints**
per request, using `cache_control: {"type": "ephemeral"}` on a
content block. Common pattern:

```python
{
    "system": [
        {"type": "text", "text": LONG_SYSTEM_PROMPT,
         "cache_control": {"type": "ephemeral"}},
    ],
    "tools": [...,
              {"type": "tool", ..., "cache_control": {"type": "ephemeral"}}],
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": FEW_SHOT_EXAMPLES,
             "cache_control": {"type": "ephemeral"}},
            {"type": "text", "text": user_question},
        ]},
    ],
}
```

Three breakpoints: end of system prompt, end of tools, end of
few-shot examples. Each marks "everything up to here is stable;
cache it." The variable user question lives *after* the last
breakpoint, so it doesn't bust the prefix.

## The TTL gotcha (March 2026 change)

**Anthropic dropped the default cache TTL from 1 hour to 5 minutes
in March 2026.** If your code was written before that and assumes
the longer window, your cache hit rate quietly tanked. The fix is
to pass the TTL explicitly:

```python
"cache_control": {"type": "ephemeral", "ttl": "1h"}
```

The 1-hour cache costs 2× input rate to write (vs 1.25× for the
5-minute one) but doesn't expire mid-conversation. For agents that
loop for more than 5 minutes per session, the 1-hour TTL is
strictly cheaper.

This is the bug step 7 fixes — code that worked in February 2026
and started silently overspending in March 2026.

## What everyone calls it

| Provider | Primitive |
|---|---|
| **Anthropic** | `cache_control: {"type": "ephemeral", "ttl": "5m"\|"1h"}` — explicit per-block |
| **OpenAI** | Automatic prompt caching (no opt-in) on inputs >1024 tokens; `previous_response_id` for server-side state in Responses API |
| **Vercel AI SDK** | `providerOptions.anthropic.cacheControl` (passes through to Anthropic) |
| **Google Gemini** | `cached_content` with explicit `ttl` parameter |

Same primitive across providers; different ergonomics. Anthropic's
is the most explicit; OpenAI's is the most automatic.

## What you'll build

A `cost_estimate(stable_tokens, variable_tokens, calls, cached)`
that computes cost for both cached and uncached agent runs. Then
the bug fix for variable-at-start (cache buster). Then the bug fix
for the missing explicit TTL.
