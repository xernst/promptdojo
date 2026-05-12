---
xp: 1
estSeconds: 220
concept: anthropic-five-patterns
---

# Every framework implements the same five patterns

In December 2024, Anthropic published *Building Effective Agents*.
It's the most-cited piece of agent engineering writing of the last
year, and the most-imitated. The post does two things. First, it
distinguishes *workflows* (LLMs orchestrated through predefined code
paths) from *agents* (LLMs that direct their own paths). Second, it
names the five canonical patterns that show up across every
production agent system.

Anthropic's post also distinguishes these five WORKFLOW patterns
from a sixth, distinct ARCHITECTURE: **"agents"** — autonomous loops
where the model directs its own tool use rather than following a
pre-set graph. The five below are the workflow shapes. The agent
loop (chapter 16) is the sixth.

If you read the docs of LangGraph, CrewAI, AutoGen, Vercel AI SDK,
DSPy, or any other framework, you'll find each of these patterns
implemented under a different name. They are the universal
primitives. Knowing them lets you read any framework's docs in
ten minutes flat.

## 1. Prompt chaining

A task is decomposed into a sequence of LLM calls, each processing
the output of the previous one. You can add "gates" between calls
— programmatic checks that validate intermediate results before
continuing.

**When it's right:** the task decomposes cleanly into fixed
subtasks. Example: generate a marketing draft, then translate it,
then summarize.

**Framework names:** LangGraph linear edges. Vercel AI SDK
`generateText` calls in sequence. LangChain's old `SequentialChain`.

## 2. Routing

A classifier LLM (or a smaller model) inspects the input and routes
it to one of several specialized downstream prompts/agents/tools.

**When it's right:** the inputs fall into distinct categories that
benefit from different handling. Example: a customer support agent
that routes refund requests to one prompt, technical questions to
another, and account changes to a third.

**Framework names:** LangGraph conditional edges. CrewAI's task
dispatch. The Vercel AI SDK's `experimental_telemetry` routing
patterns. You did this exact pattern in chapter 16, step 3.

## 3. Parallelization

Multiple LLM calls run simultaneously and their outputs are
aggregated. Two flavors: **sectioning** (split the work into
independent pieces) and **voting** (run the same task multiple times
and merge for higher confidence).

**When it's right:** subtasks are independent and benefit from
parallel execution. Example: a code review that asks one call to
check for security issues, another to check for style, another to
check for test coverage — all simultaneously.

**Framework names:** LangGraph's `Send` API. CrewAI's parallel task
execution. Vercel AI SDK's `Promise.all` over multiple `streamText`
calls. Or just raw `asyncio.gather` in a custom loop.

## 4. Orchestrator-workers

A central orchestrator LLM dynamically decomposes a task into
subtasks, dispatches each to a worker LLM, and synthesizes the
results. The decomposition isn't predefined — the orchestrator
figures it out at runtime.

**When it's right:** you can't predict the subtasks ahead of time.
Example: a coding agent that decides which files to edit based on
the user's request, then dispatches edits to per-file worker
agents.

**Framework names:** CrewAI's "manager agent" with delegated tasks.
AutoGen's `GroupChatManager`. LangGraph's "supervisor" pattern.
Anthropic's own `claude-code` is largely this shape.

## 5. Evaluator-optimizer

One LLM generates a response; another LLM evaluates it and provides
feedback; the first revises. Loop until the evaluator passes or a
max iteration count is hit.

**When it's right:** there are clear quality criteria you can
encode in an evaluator prompt, AND iteration measurably improves
results. Example: literary translation, where a generator drafts
and a critic flags nuance loss.

**Framework names:** LangGraph "reflection" patterns. DSPy's
optimizer module. Vercel AI SDK called in a loop. You wrote
exactly this in chapter 16, step 4.

## What this means for buy-vs-build

Every framework's *abstractions* are different. Every framework's
*capabilities* are the same five patterns above. When you read a
framework's docs and it markets a feature called "multi-agent
delegation" or "reflection chains" or "supervisor mode" — go look
up which of the five patterns it actually is. You'll always find
the match. The market name is the framework's flavor; the
underlying shape is in this list.

Two consequences:

1. **No framework gives you more capability than the loop you
   already wrote.** All five patterns are 50-100 lines of Python
   each, on top of the 30-line core loop. Frameworks make them
   ergonomic; they don't make them possible.
2. **Framework choice is taste, not technology.** When you ask
   "which framework should I use?", what you're really asking is
   "whose taste in abstractions matches my team's?" That's a
   reasonable question with a reasonable answer, but it isn't a
   capability question. Anyone who tells you "X framework lets
   you do Y that nothing else can" is misreading the landscape.

## What the practitioners actually do

The companies whose agent products you've heard of — Cursor, Devin,
Perplexity, Replit, the Claude Code team itself — overwhelmingly
ship custom loops in production. The frameworks live in their
prototyping codebases, in their academic publications, in their
hiring exercises. The thing that runs at scale is the loop you
wrote in chapter 16, dressed up with the company's specific
durability, observability, and tool-set decisions.

The next mc tests when adding a framework makes things *worse*.
Then you'll write the buy-vs-build memo yourself.
