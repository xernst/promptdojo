---
xp: 1
estSeconds: 110
concept: mcp-as-tool-source
code: |
  # MCP turns "tools my code defines" into "tools the agent discovers
  # at runtime by asking a server." JSON-RPC 2.0 over stdio or HTTP.

  # tools/list response (server says: here are my tools)
  tools_list_response = {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
          "tools": [
              {
                  "name": "search",
                  "description": "Web search.",
                  "inputSchema": {
                      "type": "object",
                      "properties": {"q": {"type": "string"}},
                      "required": ["q"],
                  },
              },
          ],
      },
  }

  # adapt the server's tool definitions into our local registry shape.
  for tool in tools_list_response["result"]["tools"]:
      print(f"name: {tool['name']}")
      print(f"desc: {tool['description']}")
      print(f"required: {tool['inputSchema']['required']}")
runnable: true
---

# Tools that come from somewhere else

Lessons 01–04 built an agent whose tools live in your Python code —
a `TOOLS` dict mapping name to function. That works until you want
to add a tool *without* deploying. Or share a tool across multiple
agents. Or let a third party publish a tool you can install like a
plugin.

That's what MCP — the Model Context Protocol — solves. Chapter 15
introduced it. This lesson wires it through your agent.

## The shape, in 30 seconds

**Three primitives** in MCP: tools, resources, prompts. We're using
tools. Each MCP server exposes:

- `tools/list` — "what tools do you have?"
- `tools/call` — "run this tool with these arguments"

Both calls are JSON-RPC 2.0. The server runs as a separate process
(stdio transport) or over HTTP (Streamable HTTP transport). Your
agent doesn't care which — it just makes the call.

## Why use MCP instead of a local `TOOLS` dict?

Three real reasons, in increasing order of importance:

1. **Plugin model.** A user installs a Slack MCP server, you
   instantly have `slack_post_message` and `slack_search` available
   to your agent. No code changes.
2. **Cross-language.** Your agent is Python; the MCP server can be
   TypeScript, Go, Rust. Same protocol, doesn't matter.
3. **Sandboxing.** The MCP server runs in its own process with its
   own filesystem/network access. If the agent makes a tool do
   something malicious, the blast radius is the server, not your
   whole app.

The cost: one network hop per tool call (or one IPC over stdio).
For high-volume tools you'll keep a local fast path; for the long
tail (one-off integrations), MCP is the right bet.

## What "wiring it" means in code

Your existing tool registry is `TOOLS = {"search": search_fn}` and
`SCHEMAS = {"search": {...}}`. You bridge MCP by:

1. **Discovery**: call `tools/list` once at startup, get back a list
   of tool definitions.
2. **Registration**: convert each MCP tool into your registry
   format. Names match. `inputSchema` maps to your validator
   schema. The "function" becomes a closure that calls the MCP
   server's `tools/call`.
3. **Dispatch**: when the agent's loop wants to run `search`, the
   closure makes a `tools/call` request and returns the result.

The agent loop *doesn't change*. It still calls `TOOLS[name](**args)`.
The function just happens to be a network call now.

## What you'll build

A `mcp_tools_to_registry(tools_list)` function that converts a
JSON-RPC `tools/list` response into your `TOOLS` and `SCHEMAS`
dicts. Then a fix for the most common bug: reading
`response["content"]` directly when the real shape wraps it inside
`response["result"]`. Then a fix for ignoring the `isError` flag
that MCP servers set when a tool fails.
