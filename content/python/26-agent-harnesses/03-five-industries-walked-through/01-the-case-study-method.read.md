---
xp: 1
estSeconds: 180
concept: case-study-method
---

# Reading other people's businesses is the cheapest education in the AI era

This lesson is a theory lesson. There is barely any code. That is on
purpose. The previous lesson gave you a framework
(`is_ai_native_ready(spec)`); this lesson gives you five examples of
that framework applied to real industries. The point is pattern
recognition. By the end you should be able to look at any service
business and answer the question "what does this look like when 80% of
the operational work is handled by agents?"

If you've read the curriculum this far, you've spent most of your time
on code. That's the right move when you're learning to read what AI
ships you. It's the wrong move when you're trying to figure out which
company to build, or which workflow at your current job to rebuild
first. For that question, the bottleneck is not Python. It is
**pattern intuition** — the ability to look at a messy real-world
process and see the underlying machine.

That intuition comes from reading case studies, not from drilling
syntax. So this lesson is mostly prose. Skim it once, then come back
when you're sketching a real project.

## The five industries

Greg Isenberg's writing on AI-native services has named categories
where AI-native companies will out-execute incumbents: agencies,
brokerages, law-adjacent services, accounting firms, compliance
shops, healthcare admin, real estate operations, education services,
logistics coordinators, BPOs. We're going to walk through three of
them in detail, then add two from elsewhere in the discourse (a
process-debt-in-software-dev example, and a support-ops example).

The five we'll cover:

1. **Home services** — the inbound-job-to-paid-job lifecycle
2. **Insurance brokerage** — the document-heavy renewal cycle
3. **Recruiting** — the source-to-place pipeline
4. **Support operations** — the ticket-to-resolution flow
5. **Software development** — process debt and the QA bottleneck

For each, we'll show:

- What the workflow looks like under the OLD model (humans coordinating, tools sprinkled)
- What the workflow looks like under the AI-NATIVE model (agents executing, humans supervising)
- Where the wedge sits — i.e., the one or two specific decisions that, once automated, cascade through the rest of the business
- The metric that proves the rebuild worked

## What you're looking for as you read

The same three signals across every example:

1. **High volume + existing rules + over-coordinated humans.** This is
   the step 1 criterion. Every case study below hits all
   three.
2. **Implicit knowledge made explicit.** Watch for the moment in each
   case study where some piece of tribal knowledge ("Sarah handles
   that one") becomes an explicit rule the agent can read.
3. **The human's role becomes more leveraged, not less important.**
   The recruiter stops being a data janitor and becomes a
   relationship closer. The support lead stops routing tickets and
   starts designing escalation logic. Watch for this transition in
   every case.

If you can see those three signals in each industry, you can probably
see them in your own industry. That's the whole point.

## A note on what this is not

This is not a "here's how to use ChatGPT for your business" lesson.
This is a lesson on what it takes to **restructure** a business so
agents can run inside it. The central thesis (echoing Isenberg's
writing on AI-native services):

> An AI-native company is not a company that uses AI. It is a company
> that has been rebuilt so AI can actually operate inside it.

The case studies that follow describe rebuilds. Bolt-on chatbot
implementations don't count. Custom GPTs labeled "Brand Voice
Assistant" don't count. The bar is: **could a small team operate a
business at 5-10× the productivity of a comparable incumbent because
the workflow itself is machine-readable?**

If yes, it's AI-native. If no, it's AI-assisted.
