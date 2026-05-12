---
xp: 1
estSeconds: 220
concept: framework-convergence
---

# Five frameworks, one loop

You just wrote the agent loop in chapter 16, step 1.8. Thirty lines.
A `while turn < max_turns:` block, one `messages.create` call, a
`stop_reason` branch on `tool_use` vs `end_turn`, and a `messages.append`
for the tool result. That's the whole machine.

Now open the source of any "agent framework" shipped in the last
eighteen months. LangGraph. CrewAI. AutoGen. Vercel AI SDK. OpenAI's
Swarm (and its successor, the Agents SDK). DSPy's agent module.
LlamaIndex agent runners. Pull up GitHub. Search for `while`. You'll
find your loop. Different class names wrapped around it, different
opinions about retries, memory, and observability, but the loop is
the same loop. Karpathy has framed it the same way: an agent is
a `while` loop with a model call inside.

It's not a slogan. It's a technical observation
about what the model API will let you build. The Anthropic and OpenAI
chat-completions APIs return a response with a stop signal and an
optional tool-use request. Anything that wants to chain tool calls
*has* to wrap that response in a loop. There is no other shape. The
API itself dictates the convergence.

## Why this matters for buy-vs-build

If every framework is the same loop, the question isn't "which one is
correct?" It's "which one's *ergonomics* match my team and my
product?" That's a real question with a real answer, but it has
nothing to do with capability. It has to do with:

- **Language fit.** If your product is a Next.js app, the Vercel AI
  SDK reads like home. If your backend is FastAPI, LangGraph is the
  obvious neighbor. Picking against the grain of your stack adds
  friction nothing else will pay back.
- **Durability needs.** If your agent has to survive a server restart
  mid-task — say, a 40-minute research run — LangGraph's checkpointed
  `StateGraph` gives you that for free. Rolling it yourself is a
  week of work.
- **Team size.** Two engineers and a deadline is framework-free
  territory. Twenty engineers and a need for shared abstractions is
  not. Frameworks are coordination tools, not capability tools.
- **Time to first demo.** A framework with sensible defaults gets you
  a demo by Friday. A from-scratch loop gets you one by Wednesday of
  next week — but the next-month features cost you less.

The frameworks are not selling capability. They're selling a
particular bundle of abstractions, a particular set of defaults, and
a particular community. When you "pick a framework" you're really
picking those three things.

## What the frameworks actually add

Strip away the marketing. What you're paying for, in order of how
much each one matters in practice:

1. **Durable state.** Checkpointing the conversation + scratchpad to
   disk so a crash doesn't lose the run. LangGraph leads here.
2. **Branching and parallelism.** Running multiple tool calls at
   once, or forking the loop down two paths and merging the result.
   You can roll this with `asyncio.gather`, but a framework gives it
   to you with one decorator.
3. **Observability hooks.** Every model call, every tool call, every
   token logged to a tracing backend. LangSmith, Helicone, Phoenix,
   Logfire — they all hook into framework-emitted events.
4. **Retry/timeout policies.** Per-tool timeouts, exponential
   backoff, dead-letter queues. You'll write these yourself anyway;
   the question is whether you want the framework's opinion or yours.
5. **Multi-agent coordination.** CrewAI and AutoGen specialize here.
   "Researcher agent talks to writer agent talks to editor agent."
   These can be valuable when your problem is genuinely multi-agent,
   and they're overkill when it isn't.

Everything above the dotted line is *the same loop you already wrote*
plus engineering work you'd otherwise do yourself.

## What Anthropic recommends

In *Building Effective Agents* (December 2024), Anthropic — the team
that builds the model the loop runs against — said it plainly:

> When using a framework, make sure you understand the underlying
> code. Incorrect assumptions about what's under the hood are a
> common source of customer error. Often, you can use LLMs directly
> rather than a framework — many of our most successful customers
> have done exactly that.

Translation: write the loop yourself first. Adopt a framework when
you outgrow your loop, not before. Devin's team, Cursor's team, and
most of the agent-shaped products that actually ship in 2025 follow
exactly this pattern — a thin custom loop in production, frameworks
used in exploration and prototyping.

## Where this lesson goes

Three reads ahead. First, LangGraph — what Harrison Chase built,
what it gives you, what it costs you. Then the Vercel AI SDK — a
completely different shape because it's a completely different
audience (web devs, streaming-first). Then the five canonical agent
patterns from Anthropic's playbook, all of which every framework
implements. By the end you'll be able to look at a project profile
and say, with confidence, "use X" or "stay framework-free." That's
the decision in step 7.
