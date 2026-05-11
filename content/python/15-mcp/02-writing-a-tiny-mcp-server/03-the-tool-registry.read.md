---
xp: 2
estSeconds: 100
concept: register-tools-with-schemas
code: |
  # a real MCP server's TOOL_REGISTRY. two tools, each with
  # description + input schema + handler.
  TOOL_REGISTRY = {
      "get_weather": {
          "description": "Get the current weather for a city.",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "city": {"type": "string"},
                  "units": {"type": "string", "enum": ["c", "f"]},
              },
              "required": ["city"],
          },
          "handler": lambda args: f"68F and sunny in {args['city']}.",
      },
      "search_docs": {
          "description": "Search the internal knowledge base.",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "query": {"type": "string"},
              },
              "required": ["query"],
          },
          "handler": lambda args: f"3 docs matched '{args['query']}'.",
      },
  }

  def list_tools(registry):
      # strip the handler — the wire format doesn't carry python functions
      return [
          {"name": name, "description": meta["description"], "inputSchema": meta["inputSchema"]}
          for name, meta in registry.items()
      ]

  for tool in list_tools(TOOL_REGISTRY):
      print(f"{tool['name']}: {tool['description']}")
runnable: true
---

# The registry is the heart of the server

When Claude Code connects to your server and asks `tools/list`,
what it gets back is *literally* the registry — minus the handler
functions, which don't survive the wire. The registry is both the
catalog the model reads and the dispatch table you call into.

## What goes in a tool entry

Three fields, every time:

- **`description`** — natural language the model reads to pick the
  right tool. This is your one chance to teach Claude when to call
  this tool and when not to. "Get the current weather for a city"
  is better than "weather function." Bad descriptions are the #1
  reason a model ignores a tool it should be using.
- **`inputSchema`** — JSON Schema describing the arguments. At
  minimum: `{"type": "object", "properties": {...}, "required": [...]}`.
  This is the contract. The model uses it to construct valid
  arguments; the server uses it to validate incoming calls.
- **`handler`** — the python function that does the actual work.
  Takes a dict of args, returns a string (or anything the dispatcher
  can stringify into a content block).

## Why the handler isn't on the wire

`tools/list` returns JSON. JSON can't carry a python function. So
when you serialize the registry for the client, you drop the
handler and keep only the description + schema. The handler stays
server-side; the dispatcher reaches into it on `tools/call`.

The `list_tools()` function in the editor does exactly this strip.

## JSON Schema in 30 seconds

You only ever need a tiny slice of JSON Schema for MCP:

```python
{
    "type": "object",          # always "object" for tool args
    "properties": {            # a dict of arg-name -> type-spec
        "city": {"type": "string"},
        "units": {"type": "string", "enum": ["c", "f"]},
    },
    "required": ["city"],      # which keys MUST be present
}
```

That's 95% of the JSON Schema you'll write for tools. `enum`
constrains a string to a fixed set. `type: "number"` and
`type: "boolean"` cover the rest. Nested objects work, but you
rarely need them.

## A trap: registering tools at import time

If your handler imports a slow library or hits an API, doing that
at registration time blows up server startup. Best practice:
**register the metadata at import; do the expensive work inside the
handler.** That way `tools/list` always returns fast and your slow
work only happens when a tool actually runs.

Run the editor. We define a two-tool registry and print what
`tools/list` would return.
