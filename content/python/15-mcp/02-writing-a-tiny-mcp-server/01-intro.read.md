---
xp: 1
estSeconds: 110
concept: tool-handler-shape
code: |
  # the three pieces every MCP server needs:
  # 1. a tool registry (what `tools/list` returns)
  # 2. a dispatcher (what `tools/call` runs)
  # 3. a response shape (the content/isError envelope)

  TOOL_REGISTRY = {
      "get_weather": {
          "description": "Get the current weather for a city.",
          "inputSchema": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
          "handler": lambda args: f"It's 68F and sunny in {args['city']}.",
      },
  }

  def call_tool(name, args):
      tool = TOOL_REGISTRY[name]
      text = tool["handler"](args)
      return {"content": [{"type": "text", "text": text}], "isError": False}

  response = call_tool("get_weather", {"city": "Seattle"})
  print(response["content"][0]["text"])
runnable: true
---

# Writing a server means writing a dispatcher

The first lesson taught you what an MCP server IS — a process that
advertises tools and runs them on request. This lesson teaches you
to write one. Not a toy: the exact shape you'd port to a real
stdio JSON-RPC server when you wrap it for Claude Code or Cursor.

A "tool handler" sounds heavy. It isn't. A tool handler is just a
function:

```python
def handler(args: dict) -> str:
    # do the work, return a string
    ...
```

Everything else is plumbing around that function.

## The three pieces every MCP server has

**1. A tool registry.** A data structure (usually a dict) that maps
tool names to their metadata: description, input schema, handler
function. When the client calls `tools/list`, you serialize the
registry — minus the handler — and send it back.

**2. A dispatcher.** A function — call it `call_tool(name, args)` —
that looks up the tool by name in the registry, validates the args
against the schema, runs the handler, and wraps the return value in
the MCP response envelope.

**3. A response shape.** Every `tools/call` response is the same
dict: `{"content": [{"type": "text", "text": "..."}], "isError": false}`.
Same shape on success. Same shape on failure (with `isError: true`).
The model treats either case as just another content block.

That's the whole server. Real MCP servers add JSON-RPC framing,
stdio transport, the `initialize` handshake, and notification
plumbing — but the *dispatch logic* is what you actually write. The
transport is a thin wrapper that most SDKs handle for you.

## Why this matters for your own use case

The interesting part of an MCP server you'd build — a knowledge-base
lookup, a CRM query, a customer-search tool — is the handler
function. The schema and registry are five lines of boilerplate. The
dispatch is ten. You spend 90% of your time on the actual API call
or DB query inside the handler. MCP is the cheapest possible wrapper
around "I have a function I want Claude to call."

## Where it goes wrong

- **No registry at all.** People hardcode tool names into giant
  `if/elif` chains. Works for two tools, breaks at ten. The registry
  is the boring abstraction that pays off later.
- **Mutating the registry at call time.** Handlers should be pure
  with respect to the registry — never edit `TOOL_REGISTRY` from
  inside a handler. State belongs in your DB or in module-level
  variables the handler reads.
- **Returning the raw value instead of the envelope.** If your
  handler returns `42`, the dispatcher has to wrap it as
  `{"content": [{"type": "text", "text": "42"}], "isError": false}`.
  The model expects content blocks, not bare values.

> **Browser note:** real MCP servers run as a subprocess speaking
> JSON-RPC over stdio (or HTTP). Pyodide can't fork processes, so
> we simulate the message dispatch in-memory: a python function that
> takes a dict, returns a dict. The shapes match exactly. When you
> port this to a real server, the only change is wiring the dict in
> and out of the JSON-RPC transport.

Run the editor. A one-tool registry, a dispatcher, and a real MCP
response envelope. This is the whole skeleton — every server you
write from now on grows from this shape.
