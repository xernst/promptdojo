---
xp: 1
estSeconds: 165
concept: approving-actions
---

# Watch the loop, approve the action

When you press enter on your instruction, the agent loop from lesson
one starts running, and now you get to see it for real.

Roughly, this happens:

1. The CLI **looks**. It checks the folder. It's empty, so there's not
   much to read, but on a real project this is where it reads your
   files.
2. It **plans**. The next concrete step is "create plan.txt with the
   three lines."
3. It gets to the **act** step, and because creating a file changes
   your machine, it stops and asks:

```
Claude wants to create plan.txt
[y] yes   [n] no
```

4. You read the proposed action. It's what you asked for. You press
   `y`.
5. The file is created. The CLI **checks** that it worked, sees it did,
   and since the job is done, it stops and tells you so.

## You are step four

That pause at the act step is the most important habit in this whole
chapter. The CLI showed you exactly what it was about to do and waited.
Your job is to actually read that line before pressing `y`.

This first time, the action is obviously fine, so `y` is easy. But the
habit you're building is the reading, not the yes. Later, on a real
project, the CLI will sometimes propose an action that isn't quite what
you meant. The only thing standing between "not quite right" and "done
anyway" is you, reading the line. Same muscle as reading the line
before `rm` in the terminal chapter. Build it now, while the stakes are
a practice file.

## Check the result yourself

When the CLI says it's done, don't just believe it. Leave the session
for a moment (`/exit`) and run, in the plain terminal:

```
cat plan.txt
```

There's your file, with your three lines. You described an outcome in
one English sentence, and it exists. That's the door, and you just
walked through it.
