---
xp: 2
estSeconds: 110
concept: four-harness-layers
code: |
  # the four layers, named and ordered.

  LAYERS = [
      "1. input prep      — load config, gather context, build messages",
      "2. model call       — messages.create with retries, cache, routing",
      "3. output parsing   — separate text from tool_use, accumulate",
      "4. tool dispatch    — run requested tools, append results, loop",
  ]
  for layer in LAYERS:
      print(layer)
---

# Four layers, in order, every time

A harness is the same four layers wrapped around the model API.
The order matters; the responsibilities are distinct.

## Layer 1 — Input prep

What the harness does **before** calling the model:

- Load the config file (CLAUDE.md, AGENTS.md, .cursor/rules) and
  merge it into the system prompt.
- Gather context: open files, recent diffs, project structure, git
  state, search results from a relevant-files index.
- Build the `messages` list: prior turns + this turn.
- Set up tool definitions to send alongside.

This is where most production harnesses spend the most code,
because *what* the model sees determines *what* it does. Cursor's
codebase index, Aider's repo map, Claude Code's hooks — all
layer-1 features.

## Layer 2 — Model call

The actual API call:

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    system=system_prompt,
    messages=messages,
    tools=tool_definitions,
    max_tokens=4096,
)
```

Boring code. But harnesses differ on:

- **Retries**: transient 429/503 errors. Without retries, the
  harness crashes on every rate-limit hit. (Step 6 fixes this.)
- **Streaming**: read tokens as they arrive vs wait for full
  response. UX-critical for chat-style interfaces.
- **Prompt caching**: chapter 23 covered this — write once, read
  many times.
- **Provider routing**: some harnesses (Continue, AI Gateway)
  let you swap providers. Most pin to one.

## Layer 3 — Output parsing

What the harness does after the response arrives:

- Iterate `response.content`, branch on `block.type`.
- Accumulate text blocks for display.
- Collect tool_use blocks for dispatch.
- Read `stop_reason` to drive loop continuation.
- Read `usage` to track tokens and cost.

Chapter 13 lesson 02 covered the primitive. Harnesses wrap it
with display logic — Cursor's incremental edit application,
Aider's diff rendering, Claude Code's progress indicators.

## Layer 4 — Tool dispatch

For each tool_use block:

- Look up the function in a tool registry.
- Validate the input (chapter 25 lesson 03 — Pydantic).
- Run the tool with the validated args.
- Format the result as a `tool_result` block.
- Append back to messages and loop.

This is what makes a harness *agentic*. Without layer 4, the
model can talk but can't change anything. The tool registry is
the contract: which tools the harness exposes to the model.

Common bugs at layer 4:

- **Hardcoded registry** inside the loop — every new tool means
  editing the loop. (Step 7 fixes this.)
- **Missing validation** — tool runs with garbage input, crashes
  deep in the stack.
- **Errors swallowed silently** — tool throws, harness logs and
  continues, model thinks the tool succeeded.

## How the layers compose

```python
def harness(user_input, config, tool_registry, history):
    # LAYER 1: input prep
    messages = build_messages(history, user_input, config)
    tools = build_tool_defs(tool_registry)

    for iteration in range(MAX_ITERATIONS):
        # LAYER 2: model call (with retries)
        response = call_with_retries(messages, tools)

        # LAYER 3: output parsing
        text_parts, tool_calls, stop_reason = parse_response(response)

        if stop_reason == "end_turn":
            return " ".join(text_parts), history

        # LAYER 4: tool dispatch
        tool_results = []
        for call in tool_calls:
            output = dispatch(call, tool_registry)
            tool_results.append({"tool_use_id": call.id, "content": output})

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return "iteration cap hit", history
```

About 30 lines of structure. Every harness you've used is built
on this skeleton. The differences are in what each layer adds.

## Where each harness invests

| Harness | Strongest layer |
|---|---|
| **Aider** | 1 (repo-map context gathering) |
| **Cursor** | 4 (edit application, tool palette UX) |
| **Claude Code** | 1 + 4 (CLAUDE.md hierarchy + comprehensive tool set, hooks) |
| **Continue** | 2 (multi-provider routing) |
| **Cline** | 4 (browser tools, terminal, plan mode) |

Picking a harness for a task is mostly a layer-strength match.
"I need codebase awareness" → Aider. "I need a slick edit
experience" → Cursor. "I need to wire MCP servers" → Claude Code
or Codex.
