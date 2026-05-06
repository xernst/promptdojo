---
xp: 1
estSeconds: 110
concept: routing-pattern
code: |
  # routing in five lines: ask a small model "what is this?", then dispatch.

  def classify(question):
      # in real code, this is an LLM call constrained to one of the keys.
      if "refund" in question.lower(): return "billing"
      if "error"  in question.lower(): return "technical"
      return "general"

  ROUTES = {
      "billing":   lambda q: f"[billing agent] processing: {q}",
      "technical": lambda q: f"[tech agent] debugging: {q}",
      "general":   lambda q: f"[general agent] answering: {q}",
  }

  def route(question):
      category = classify(question)
      handler = ROUTES[category]
      return handler(question)

  print(route("I need a refund for my order"))
  print(route("Getting a 500 error"))
  print(route("How does this work?"))
runnable: true
---

# Pick the path before you do the work

Lesson 02 had one agent with many tools. Routing flips it: many
*specialist* agents, and a small classifier picks which one runs.

The shape is intuitive once you see it. A user asks something. You
don't send it to your one mega-prompt. You send it to a tiny model
call whose only job is to return a category — `billing`,
`technical`, `general` — and that category maps to a handler with
its own prompt, its own tools, and possibly its own model size.

Every customer support bot you've ever talked to is doing this.
Every "tell me what kind of question this is, then I'll answer" UX
is doing this. Anthropic's *Building Effective Agents* post calls it
one of the five canonical patterns. LangChain calls it a
`RouterChain`. The Vercel AI SDK exposes it via `experimental_output`
+ a switch. Same primitive underneath — small classifier, dispatch
table, specialist runs.

## Why route at all

Three reasons, in the order they bite:

1. **One mega-prompt rots fast.** A prompt that handles billing AND
   technical AND general gets longer every time you find an edge
   case. By the third edge case it contradicts itself, and the model
   guesses.
2. **Different routes have different costs.** A billing question
   needs to read the order database and call the refund API. A
   "what time do you open" question needs neither. Routing lets you
   call cheap tools for cheap routes and expensive tools only when
   you have to.
3. **Different routes have different models.** Sometimes the
   billing route needs your best, most cautious model. The general
   route is fine on Haiku. Routing makes that choice explicit.

## The two-call shape

Most routers run as two model calls per user turn:

```
user → classifier (small model)  →  category
       category + user → specialist (any model) → answer
```

The classifier call is short and cheap. The specialist call is
where the real work happens. People who measure tokens find the
classifier costs about 5% of what one big merged prompt would —
and the specialist's answer quality is *higher* because its prompt
is smaller and focused.

## When NOT to route

Routing is overkill when:

- You only have one path. Don't add a classifier whose answer is
  always the same.
- The categories overlap heavily and you'll need cross-route
  context anyway. (You probably want one prompt with branches, not
  routing.)
- The user can pick the category from a UI dropdown. The user is a
  better classifier than your model and free.

The bug isn't "should I route" — it's "should this *new* path become
its own route, or fold into an existing route." Default to folding
until a route earns its keep.

## What you'll build

A `route(question)` function that calls a tiny classifier, looks up
the matching specialist in a dispatch table, and runs it. Then a
fallback for when the classifier returns garbage. Then a real
multi-route agent that handles three categories plus an unknown.
