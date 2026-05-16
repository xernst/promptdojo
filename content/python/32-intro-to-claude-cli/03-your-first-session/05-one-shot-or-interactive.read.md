---
xp: 1
estSeconds: 150
concept: interactive-vs-one-shot
---

# Two ways to run it: stay, or fire once

You started the CLI by typing `claude` and got a session you can talk
back and forth in. That's **interactive mode**, and it's the one you'll
use most. You give an instruction, watch it work, give the next one,
all in one running conversation. Good for real work, where one thing
leads to the next.

There's a second way, for when you want exactly one thing and then out.
From the plain terminal, you give the instruction right on the command
line with a `-p`:

```
claude -p "summarize what is in plan.txt"
```

This is **one-shot mode**. The CLI starts, does the single thing you
asked, prints the result, and quits. No session, no back-and-forth.
The `-p` is an option (a dash and a letter, like the options from the
terminal chapter); it means "here is your prompt, just do it."

## When to use which

- **Interactive** (`claude`): real work, anything with more than one
  step, anything where you'll want to react and steer. This is your
  default.
- **One-shot** (`claude -p "..."`): a single quick question or action
  where you already know there's no follow-up. "Summarize this file."
  "What does this command do."

You don't need to master one-shot mode now. It mostly matters later,
when you want the CLI to run as one step inside a larger automated job,
and a job can't sit in an interactive session. For today, know it
exists, and know that `claude` on its own, interactive, is the mode for
learning and for real building.
