---
xp: 1
estSeconds: 110
concept: prompt-structure
code: |
  # this is a Python dict, but read it like a prompt template.
  prompt_parts = {
      "role": "You are a senior backend engineer working in this fastapi codebase.",
      "task": "Add a GET /orders/{id} endpoint that returns one order.",
      "context": "I'm editing app/api/orders.py. It uses fastapi and a postgres pool.",
      "format": "Show me the diff only. No explanation.",
      "examples": "See get_user() in app/api/users.py for the pattern to match.",
      "constraints": "Use the existing get_pool() helper. Return 404 if missing.",
  }

  for part, value in prompt_parts.items():
      print(f"{part}: {value}")
runnable: true
---

# The prompt is the spec

Watch what happens when you ask Cursor *"add an orders endpoint"* with
nothing else. It picks a router file at random. It invents a database
helper that doesn't exist. It adds three error cases you didn't ask for
and skips the one that matters. You spend twenty minutes reading code
that fights your codebase.

Now watch what happens when you ask the same question with a few
sentences of structure. Cursor lands a diff in one shot. You read it,
maybe tweak two lines, and ship.

Recall the five-knob scaffold from chapter 0 — Role, Task, Context,
Format, Examples. In this chapter we're going to drill on each knob
in depth, plus add a sixth that matters in production: **Constraints**.
That gives you the working six-knob scaffold for shipping code with AI.
Run the editor on the right and read it out loud.

## Knob 1: role

*Who is the model, in the context of this task?*

```
You are a senior backend engineer working in this fastapi codebase.
```

You met this knob in ch00. In a coding context it sets defaults:
"senior backend engineer" produces different output than "junior dev
learning fastapi," even with the same task. If you don't set the role,
the model picks one for you, and the default is "helpful generic
assistant" — which is what makes most coding output sound like a
Stack Overflow accepted answer from 2019.

## Knob 2: task

*The single concrete thing you want.*

```
Add a GET /orders/{id} endpoint that returns one order.
```

One sentence. One outcome. If you find yourself writing "and also" or
"while we're at it," stop. That's two prompts pretending to be one.
Send them separately. The model handles one well-scoped task per turn
much better than two half-scoped ones.

## Knob 3: context

*What file am I in. What stack. What does the model need to know to do
the task well.*

```
I'm editing app/api/orders.py. It uses fastapi and a postgres pool.
```

This is the part most people skip, and it's the part that does the most
work. Without it, the model is guessing what kind of project you're in,
and a guess takes ten generated tokens to wrong-foot you for the rest
of the session.

In Cursor, Agent mode pulls workspace and open-file context
automatically (other modes are mode-dependent — `@`-reference
explicitly when in doubt). In Claude Code, what's in the conversation
IS context.
Either way, **make the relevant file or pattern visible before you ask
the question.** Paste a snippet, open the file, or add it with `@`.

## Knob 4: format

*How you want the answer back.*

```
Show me the diff only. No explanation.
```

This is the most overlooked knob. AI tools default to *explaining* what
they did, which is helpful when you're learning and noise when you're
shipping. Tell it: "diff only," "code only," "list of file paths," "two
sentences max." The format constraint is free token savings on every
turn.

## Knob 5: examples

*What does good output look like in this codebase?*

```
See get_user() in app/api/users.py for the pattern to match.
```

In a coding context, your best examples are usually already in the
repo. Point the model at them. "Match the style of `get_user()`."
"Use the same error envelope as `app/api/errors.py`." One pointer to
working code beats three paragraphs of style guidance.

## Knob 6: constraints (the new one)

*What you must use. What you must not do. What edge cases matter.*

```
Use the existing get_pool() helper. Return 404 if missing.
```

This is the production-only knob — the one the ch00 scaffold didn't
need but a real codebase does. Every constraint you state up front is
a wrong path the model never goes down. "Don't add new dependencies."
"No try/except for happy-path errors — let them bubble." Each line is
a fence.

## What the six knobs do together

When you read AI-generated code that's wrong, almost every time you can
trace the wrongness back to a missing knob:

- **Wrong tone or default approach?** Missing role.
- **Did six things you didn't ask for?** Missing task scope.
- **Wrong stack assumed?** Missing context.
- **Wall of unwanted commentary?** Missing format.
- **Doesn't match the codebase style?** Missing examples.
- **Used a banned library?** Missing constraint.

Get all six in. The model has nothing to invent.

## What this lesson covers

Eight more steps. By the end you'll be able to look at a vague prompt
and rewrite it on the spot, you'll know when a long-running session has
gone toxic, and you'll have one tool — the *show me your plan first*
prefix — that turns every prompt into a checkable two-step.
