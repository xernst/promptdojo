---
xp: 1
estSeconds: 130
concept: harness-vs-raw-call
code: |
  # the same model call, two ways. one's a "raw API call." one's a "harness."
  # the difference is what's wrapped around it.

  def raw_call(prompt):
      # imagine: client.messages.create(model=..., messages=[{"role": "user", "content": prompt}])
      return f"[model says something about: {prompt}]"

  def harness(user_input, config, tools, history):
      # 1. INPUT PREP: load config, build messages from history + new input
      messages = list(history) + [{"role": "user", "content": user_input}]

      # 2. MODEL CALL: with retries, prompt cache, provider routing
      response = raw_call(user_input)

      # 3. OUTPUT PARSING: separate text from tool_use blocks
      text_parts = [response]  # mock: response is just text
      tool_calls = []          # mock: no tools called this turn

      # 4. TOOL DISPATCH: run any tool the model asked for
      for call in tool_calls:
          tools[call["name"]](**call["input"])

      # update history, return
      history.append({"role": "assistant", "content": response})
      return " ".join(text_parts), history

  text, _ = harness("hi", config={}, tools={}, history=[])
  print(f"raw:     {raw_call('hi')}")
  print(f"harness: {text}")
runnable: true
---

# A harness is everything between you and `messages.create`

You type "fix the bug in this file." Claude Code reads CLAUDE.md,
opens the file, gathers your recent commits, builds a system
prompt, calls Claude, reads back tool_use blocks, runs the
edits, shows you a diff, asks for approval, applies. Then it
records what happened to a trace.

The model call in the middle is one line of code. **Everything
else is the harness.**

This is true for every coding agent you've used:

| Agent | What it adds on top of the raw API |
|---|---|
| **Claude Code** | CLAUDE.md hierarchy, hooks, slash commands, MCP integration, session-resume |
| **Cursor** | tab autocomplete, edit-application diff UI, multi-file context, codebase index |
| **Aider** | git-aware context, repo map, in-place edit-application |
| **Continue** | VS Code integration, custom rules, multi-provider routing |
| **Cline** | step-by-step plan mode, terminal integration, browser automation |
| **Codex CLI** | AGENTS.md hierarchy, sandboxed execution, MCP support |

All of them, underneath, are the same four layers wrapped around a
`messages.create` (or equivalent).

## Why "harness" is the right name

The word comes from machine learning research — a "test harness"
runs models against fixed inputs to measure outputs. The agent
sense is similar: code that wraps a model so it can DO things, not
just describe them.

The narrower term "agent" usually means the *loop* (chapter 16). A
harness is the loop PLUS the input prep, output rendering, tool
registry, configuration, and observability layers. Loop is a
function. Harness is a product.

## What this lesson is NOT

- Not a tutorial on which harness to install.
- Not a deep dive on Cursor/Aider/Claude Code internals.
- Not a guide to building a competitive product harness.

What it IS: the four layers that show up in every harness, the
language to talk about them, and the four bugs that show up when
those layers are mis-built.

## What you'll build

A minimal harness in <70 lines: input prep + model call + output
parsing + tool dispatch, wired through with a deterministic mock
model so it runs in Pyodide. Then bug fixes for the two most
common harness bugs: missing retries (transient errors crash the
loop) and hardcoded tool registry (can't add tools without
editing the loop).

The harness you'll build is the harness underneath every product
you've used. Once you've built it once, you can read any
harness's source and recognize the same shape inside.
