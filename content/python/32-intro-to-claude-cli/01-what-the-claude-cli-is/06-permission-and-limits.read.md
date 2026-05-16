---
xp: 1
estSeconds: 165
concept: cli-permissions
---

# It asks before it acts

A tool that can change your files sounds like a tool that could wreck
your files. It's a fair worry, and the answer is built into how the CLI
behaves: it asks first.

When the CLI wants to do something that changes your machine, it stops
and shows you the exact action before it happens:

```
Claude wants to create the file: budget.txt
[y] yes   [n] no   [a] yes, and don't ask again for this
```

Nothing changes until you choose. Reading a file, it'll often just do.
Changing or deleting a file, or running a command, it shows you and
waits. You are the approve button. The loop from the last step pauses
at the act step for anything that matters, and resumes when you say go.

This is the same respect-the-line habit you learned with `rm` in the
terminal chapter. Read what it's about to do. If it's what you wanted,
approve it. If it isn't, decline, and tell it what you actually meant.

## What it can't do

A few honest limits, so you know the edges:

- **It works in the folder you start it in.** Start the CLI in your
  `practice` folder and that folder is its world. It isn't roaming your
  whole computer.
- **It can be wrong.** It's the same model as the chat, which means it
  can misread a request or make a mistake. The loop catches many
  mistakes, but not all. This entire course exists to teach you to
  catch the rest.
- **It doesn't remember between sessions.** Close the CLI and the next
  session starts fresh. It reads your files again; it doesn't recall
  yesterday's conversation.

None of these are flaws to fear. They're the shape of the tool. You
stay in control because it asks, because it's scoped to one folder, and
because you learned to read the line before pressing enter.
