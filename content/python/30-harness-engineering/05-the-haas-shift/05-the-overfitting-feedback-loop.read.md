---
xp: 1
estSeconds: 220
concept: model-harness-coupling
---

# Your "best" harness is the one your model was post-trained on

A subtle point Osmani makes and that HumanLayer reinforces with the Terminal Bench numbers: **the harness and the model are now coupled**. The model labs post-train their flagship models on the harnesses they ship. That means a model's effective intelligence is partially a function of *whether the harness it's running in matches the harness it was trained on*.

This is the *overfitting feedback loop*. It is not a bug; it is a deliberate design choice by the labs. Anthropic post-trains Claude on Claude Code's surface. OpenAI post-trains GPT on Codex's surface. The result: Claude is exceptionally good at Claude Code's tool palette, the Task subagent dispatch, the bash conventions Claude Code uses. Put Claude in a different harness with a different tool palette, and you lose some of that fluency.

## The Terminal Bench evidence

The cleanest empirical receipt comes from Terminal Bench 2.0 results published in early 2026 and referenced by HumanLayer:

- **Claude Opus 4.6 in Claude Code**: rank #33 on the leaderboard.
- **Claude Opus 4.6 in a different harness**: rank #5.

Same model. Different harness. 28 places on the leaderboard (±4 positions per HumanLayer's stated margin).

Note something subtle here: Claude Code, which is *the* harness Anthropic post-trains on, did *not* produce the highest Terminal Bench score. A different harness — one apparently better tuned to Terminal Bench's specific task shape — performed better. The lab's post-training is biased toward general-purpose coding tasks, not benchmark-specific ones.

This cuts two ways. It validates that harnesses matter (the gap is 28 places). It also rules out a naive "always match the lab's harness" rule — the gap is real, but matching the lab's harness isn't always optimal.

## Why post-training amplifies this

Mechanically: when Anthropic does RL training rounds on Claude, the training tasks involve calling Claude Code's actual tools. The model gets reward signal for using the `Bash` tool with the conventions Claude Code uses, the `Edit` tool with the patches Claude Code expects, the `Task` tool with the dispatch shape Claude Code dispatches.

A different harness might have a tool called `RunShell` instead of `Bash`. Same job, different name and signature. The model has never seen `RunShell` in training. It will still produce reasonable tool-call shapes because BPE tokenizers plus the model's training on JSON-like structures generalize across never-seen tool names — the same generalization that lets it produce Python it has never literally seen. But the *fluency* — precise knowledge of input shape, typical use patterns, edge cases — is reduced.

The fluency gap shows up as:

- More malformed tool calls (lower hit rate per first attempt).
- More verbose tool calls (the model "explains" itself more when it's less confident).
- More retries (the model double-checks itself).
- More tokens spent per task.

In aggregate: same model, more effort, sometimes worse output.

## What this means for build-vs-buy

Three consequences:

1. **If you're building on Claude, the Claude Agent SDK is the safest default.** It mirrors Claude Code's harness shape, which mirrors what Claude was post-trained on. You're swimming with the current.
2. **If you're building on GPT, the OpenAI Agents SDK has the same advantage.** Codex-shaped harness, Codex-tuned model.
3. **If you're rolling your own harness with custom tool names and unusual lifecycle hooks, expect lower performance than the same model in a vendor-aligned harness.** This is real, measurable, and not something prompt engineering fully fixes.

## What this rules out

Two beliefs the overfitting feedback loop should kill:

- **"Models are interchangeable; just swap providers."** The post-training distribution makes them *not* interchangeable. A custom harness that ran well on Claude may run noticeably worse on GPT, and vice versa.
- **"My harness is model-agnostic."** It can be, but you pay for it in performance. The cleanest test: run your harness on three different providers, look at task success rates. If they're identical, your harness is genuinely agnostic — and probably underexploiting at least one of them.

## The skill it adds to your engineering practice

Two habits worth adopting:

- **Name the target model.** When you write a harness, write it for a specific model family. "This is a Claude harness." "This is a GPT harness." The model-agnostic harness is a fiction worth dropping unless you're explicitly building a router.
- **Match tool names to the lab's conventions when you can.** If Claude was post-trained on `Bash` as a tool name, call yours `Bash`. If `Edit` was the name in Claude Code, use `Edit`. Reusing names is free fluency.

## What's next

MCP security as the next read — a related concern, since MCP servers populate tool descriptions in the system prompt, and a malicious MCP server can inject instructions that the model treats as legitimate. Then the picks-the-debt drill, the build-vs-buy write step, and the portfolio-routing checkpoint.
