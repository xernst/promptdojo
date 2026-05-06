---
xp: 2
estSeconds: 100
concept: mcp-tools-call-shape
code: |
  # the shape of a tools/call request and response.
  # JSON-RPC 2.0 — id correlates request to response.

  request = {
      "jsonrpc": "2.0",
      "id": 42,
      "method": "tools/call",
      "params": {
          "name": "search",
          "arguments": {"q": "ramen tokyo"},
      },
  }

  # success response:
  ok_response = {
      "jsonrpc": "2.0",
      "id": 42,
      "result": {
          "content": [
              {"type": "text", "text": "3 results for ramen tokyo"},
          ],
          "isError": False,
      },
  }

  # error response (server's tool failed, but the protocol succeeded):
  err_response = {
      "jsonrpc": "2.0",
      "id": 42,
      "result": {
          "content": [
              {"type": "text", "text": "search service unavailable"},
          ],
          "isError": True,
      },
  }

  for label, r in [("ok", ok_response), ("err", err_response)]:
      content = r["result"]["content"][0]["text"]
      err_flag = r["result"]["isError"]
      print(f"{label}: text={content!r} isError={err_flag}")
---

# Two endpoints, one wrapping shape

The whole protocol is JSON-RPC 2.0. Two methods do all the work:
`tools/list` and `tools/call`. Three things to lock in.

## 1. `tools/list` — discovery

```json
→ {"jsonrpc":"2.0","id":1,"method":"tools/list"}

← {"jsonrpc":"2.0","id":1,"result":{"tools":[
    {"name":"search","description":"...","inputSchema":{...}},
    ...
]}}
```

Note `inputSchema` (camelCase, not `input_schema`). MCP is
Python-team-staffed but the protocol is camelCase on the wire.

## 2. `tools/call` — invocation

```json
→ {"jsonrpc":"2.0","id":42,"method":"tools/call",
   "params":{"name":"search","arguments":{"q":"ramen"}}}

← {"jsonrpc":"2.0","id":42,"result":{
    "content":[{"type":"text","text":"3 results"}],
    "isError":false
}}
```

Three fields to remember in the response:

- **`result.content`** — a *list* of content blocks, like the
  Anthropic message content shape from chapter 13. Each block has a
  `type` (`text`, `image`, `resource`). For most tools you'll iterate
  the list and concatenate the text fields.
- **`result.isError`** — boolean. `True` means the tool ran, the
  protocol succeeded, but the tool reported failure. The `content`
  in this case is the error message. Treat it like a tool that
  returned an error string.
- **The wrap matters.** Beginners read `response["content"]`
  expecting the content list directly. The list is one level deeper
  — inside `response["result"]`. This is the bug step 6 fixes.

## 3. JSON-RPC errors are different from tool errors

There are TWO kinds of errors:

| Kind | Where it appears | When it fires |
|---|---|---|
| **Protocol error** | `response["error"]` (no `result` key) | Method doesn't exist, malformed JSON-RPC |
| **Tool error** | `response["result"]["isError"] == True` | Tool ran but reported failure |

Tool errors are *normal* — the user mistyped a query, an upstream
API is down, the model passed bad args. Protocol errors are
*broken* — your code or the server has a bug.

Step 7 fixes the bug where code ignores `isError` and treats every
non-protocol-error response as success — feeding actual error
messages to the model as successful tool results, which makes the
agent confidently relay nonsense.

## What this maps to in your registry

The bridge function turns each MCP tool definition into:

```python
TOOLS["search"] = lambda **args: call_mcp("search", args)
SCHEMAS["search"] = mcp_tool["inputSchema"]
```

The agent loop doesn't change. It still does
`TOOLS[name](**args)` and `validate(args, SCHEMAS[name])`. The only
new thing is the closure inside `call_mcp` that makes the JSON-RPC
request and unwraps `result.content`/`isError`.
