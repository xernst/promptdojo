---
xp: 1
estSeconds: 110
concept: tool-registry-pattern
code: |
  # the model gets a *list* of tools each turn. it picks one (or several).
  # your job is to dispatch the call to the right Python function.

  TOOLS = {
      "search": lambda q: f"3 results for {q}",
      "read_page": lambda url: f"<article from {url}>",
      "summarize": lambda text: f"summary: {text[:20]}...",
  }

  # one assistant turn — the model picked `search`.
  tool_use = {"type": "tool_use", "id": "toolu_a", "name": "search", "input": {"q": "ramen tokyo"}}

  # dispatch is a one-line lookup, not a giant if/elif.
  fn = TOOLS[tool_use["name"]]
  result = fn(**tool_use["input"])
  print(result)
runnable: true
---

# One loop, many tools

Chapter 16 lesson 1 gave you the agent loop with *one* tool. That's
the toy version. Real agents — Cursor, Claude Code, your own — have
ten, twenty, fifty tools registered. The model picks one each turn,
sometimes several in parallel, and your loop dispatches.

Good news: the loop doesn't change. Same `while`, same `stop_reason`
branches, same `tool_result` reply. The only difference is *which*
tool runs.

## What "multi-step" actually means

Anthropic's [*Building Effective Agents*](https://www.anthropic.com/engineering/building-effective-agents)
distinguishes two patterns under this name, and people mix them up:

1. **Multi-tool dispatch**. One turn, one tool — but the model
   chooses from many. `search` this turn, `read_page` next turn,
   `summarize` after that. The model orchestrates the chain; the
   loop just runs whichever tool got picked.
2. **Parallel tool calls**. One turn, *several* tool_use blocks at
   once. "Read these three files." Your loop runs all three (often
   concurrently) and replies with three `tool_result` blocks in one
   user turn.

Both are everyday production patterns. This lesson teaches dispatch
first, then parallel calls.

## Why a registry, not a chain of `if`

The naive version of this is `if name == "search": ...` repeated
ten times. It works for two tools and rots fast. Every new tool means
editing the dispatch function, and you'll forget one.

The registry pattern — a `dict` mapping name → function — is what
every framework uses internally. LangChain calls it a `Toolkit`.
LangGraph calls it `tools`. The Vercel AI SDK calls it `tools`. They
all flatten to the same shape:

```python
TOOLS = {
    "search": search_fn,
    "read_page": read_page_fn,
    "summarize": summarize_fn,
}

# anywhere in the loop:
result = TOOLS[name](**input)
```

One line of dispatch. Adding a tool is one line in the dict and one
new function. The agent loop never changes.

## Where the chain comes from

Notice that *the loop* doesn't define the order `search → read_page
→ summarize`. The model does. You hand it a registry; the model
decides which tool serves the user's question this turn, sees the
result, and decides which one comes next.

This is the part that surprises people first writing agents: there's
no orchestration code. The orchestration is the model's reasoning,
expressed as a sequence of `tool_use` blocks. Your job is to keep
the loop honest — dispatch correctly, hand back well-formed
`tool_result` blocks, and keep the message history intact.

## What you'll see in the editor

Three tools registered as a dict. One `tool_use` block from the
model picking `search`. One line of dispatch — `TOOLS[name](**input)`
— runs the right function. Print the result. Run it.

The next steps wire this dispatch into the full loop, then add
parallel tool calls and the bugs that come with them.
