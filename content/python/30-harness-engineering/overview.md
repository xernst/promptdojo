## Agent equals model plus harness

Viv Trivedy (@Vtrivedy10) wrote the cleanest definition of the discipline this curriculum has had to teach: **"Agent = Model + Harness. If you're not the model, you're the harness."** Addy Osmani's May 2026 essay *Agent Harness Engineering* built the whole framing on that line. HumanLayer's writeup, posted within weeks of Osmani's in spring 2026, landed the corollary: **"It's not a model problem. It's a configuration problem."**

Chapter 26 walked you through what a harness *is* — the four layers wrapped around `messages.create`. This chapter is about the *discipline*. Not "here are the layers" but "here is how harness engineers actually work."

## Why this chapter exists even though chapter 26 exists

Four reasons.

- **The harness gap is bigger than the model gap.** Same model in two different harnesses scores radically differently on identical benchmarks. HumanLayer published the receipts: Opus 4.6 placed #33 on Terminal Bench inside Claude Code, then #5 in a different harness (±4 positions per HumanLayer's stated margin). The model didn't change. The scaffolding did.
- **Failures are signals, not flukes.** Osmani calls it the Ratchet: every mistake becomes a permanent rule. "Every line in a good system prompt should trace back to a specific, historical failure." Most developers still treat agent mistakes like one-off bugs to retry past. Harness engineers treat them like FAA incident reports.
- **Context is now a budget, not a window.** Models degrade as windows fill (Chroma's "context rot" research is the load-bearing citation). The three real mitigations — compaction, tool-call offloading, progressive disclosure — are now engineering disciplines, not optimizations.
- **The industry is shifting from LLM APIs to Harness APIs.** Anthropic's Claude Agent SDK, OpenAI's Agents SDK, Vercel AI SDK — they all now ship the loop, tools, context management, hooks, and sandboxes out of the box. LangChain calls this the move from frameworks to runtimes. Knowing what's in the harness tells you what to buy vs build.

## What you'll be able to do at the end

- **Audit a harness inventory** — score any agent setup across the six pieces (config files, tools/MCP, infra, orchestration, hooks, observability) and call out which is missing.
- **Run the four-reflex triage** — when an agent fails, decide whether to add a rule to AGENTS.md, write a hook, split into planner+executor, or wire backpressure. No more "the model is dumb today."
- **Keep a ratchet log** — append-only record of failures + the rules they earned, with explicit removal criteria when the model catches up.
- **Plan a context budget** — pick which items load into context now, which offload to filesystem, which fetch on demand via skills/RAG. Stop dumping the world into the window.
- **Design a long-horizon loop** — when to add a planner step, when to split generator from evaluator, when to wire pre-tool and post-edit hooks, how a completion guard prevents premature exits.
- **Read the HaaS shift** — pick between Claude Agents SDK, OpenAI Agents SDK, Vercel AI SDK, and rolling your own. Spot which components are debt because the model has rendered them redundant.

## What this chapter is not

It is not a Claude Code tutorial. It is not a comparison of frameworks. It is not a list of cool MCP servers to install. It is the engineering discipline that sits *above* the tool you happen to be using — the part that survives when Cursor 5 ships and Codex pivots and the model you're targeting today gets retired in eighteen months.

Harness engineering is what's load-bearing right now. The chapter is what to do about it.
