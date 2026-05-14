## The loop is one layer of five

This chapter has been at the loop level — the thirty lines, the stop reasons, the message-history hygiene. That's one layer of a much bigger stack. If you only know the loop, you can build an agent that runs. You cannot yet predict how it will fail in production, who's going to win the industry it's built into, or where the money is actually flowing.

In May 2026, Chamath Palihapitiya published an 84-page primer titled *Deep Dive: The Agentic AI Economy*. The piece is paywalled, but the open preview lays out a five-layer map that's worth borrowing — not because Chamath invented these labels (he didn't), but because seeing them laid out side by side is the fastest way to know which conversations you're qualified to be in.

## The five layers

| Layer | Function | Key technologies |
|---|---|---|
| **Intelligence** | Reasoning and planning | Mixture-of-experts (MoE), multi-head latent attention (MLA), retrieval-augmented generation (RAG) |
| **Action** | Execution and tool use | ReAct, MCP, A2A |
| **Governance** | Policy enforcement | Deterministic rules, runtime guards |
| **Orchestration** | Control plane and routing | Multi-agent frameworks, local orchestrators |
| **Economics** | Cost-structure sustainability | Per-task business models |

Source: Chamath Palihapitiya, *Deep Dive: The Agentic AI Economy*, May 12, 2026.

The **Action** layer is the one this chapter walks through end to end. Lesson 1 of this chapter is the simplest possible expression of ReAct — *Reason → Act → Observe → Reason*. MCP is what you'll meet in chapter 15. The other four layers are everything around the loop that decides whether the loop survives contact with production.

## Two production failures, one per missing layer

Chamath's primer opens with two incidents that landed in the news while this curriculum was being written:

**December 2025 — AWS China, 13 hours offline.** An Amazon coding agent autonomously deleted and recreated a live production environment. The outage lasted thirteen hours. This is an **Orchestration** failure: the agent had the action capability (deletion was a tool it could call) but no control plane upstream blocking destructive operations on prod resources.

**April 2026 — Cursor + Claude, 9 seconds to wipe a company database.** A Cursor agent powered by Claude deleted an entire company database in nine seconds. This is a **Governance** failure: no deterministic rule said "production database mutations require a human in the loop" *before* the model's tool call dispatched.

Neither failure was an Intelligence problem. The model in both cases reasoned correctly about how to do the thing it was asked. The thing it was asked was catastrophic, and nothing between the reasoning and the keystroke caught it. If you skip Governance and Orchestration on the way to shipping, this is what shipping looks like.

## Why this matters before you write your first production agent

You will be tempted, after reading this chapter, to build something that runs autonomously against real systems. Most of the early excitement about agents is excitement about the Action layer working — "look, it called the tool!" — without the layers above. The teams that have actually shipped agents at scale describe the same arc: the Action layer worked from week one; the next six months were spent building Governance and Orchestration around it before it was allowed near customers.

Chamath cites a McKinsey 2025 *State of AI* stat: fewer than 10% of organizations have agents deployed at meaningful scale. The gap isn't capability. The gap is the four layers around the loop.

## What to take from this

When you read an agent post-mortem, ask which layer failed. Almost always it's Governance or Orchestration — the two layers PMs and founders skip first because they don't look like product. When you're scoping your own agent project in the chapter 25 capstone, spend at least as much time on what the agent *cannot* do as on what it can.

The loop is thirty lines. The stack is five layers. You've shipped the first layer in this chapter. The other four are the difference between a demo and a deploy.
