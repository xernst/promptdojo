---
xp: 1
estSeconds: 150
concept: starting-a-session
---

# Start it where the work is

The CLI works in the folder you start it in. So the first move is to
stand in the right folder, using exactly the terminal skills from the
last chapter.

Make a fresh folder to practice in, step into it, then start the CLI:

```
mkdir claude-practice
cd claude-practice
claude
```

`mkdir` and `cd` you know. The third line, `claude` on its own, starts
a session right here in `claude-practice`. That folder is now the CLI's
world for this session: empty, safe, and yours.

## What you're looking at

The CLI starts and shows you a prompt of its own, waiting for an
instruction. It looks a little different from the terminal prompt, but
the idea is identical: it's ready, and nothing happens until you type
something and press enter.

You're now in a session. The plain terminal and the CLI session are
two modes of the same window. In plain terminal mode you type commands
like `ls`. In a CLI session you type instructions in normal English.
When you want to leave the session and go back to the plain terminal,
you type `/exit` or press `Ctrl` and `C`.

## Why the empty folder matters

Starting in an empty practice folder is a deliberate choice for your
first time. The CLI can only see and change things in the folder it
started in. An empty folder means there's nothing to damage and nothing
to get confused by. You get to watch the tool work with zero risk.

Later you'll start the CLI inside real project folders, because that's
the point of it. But the first session should be somewhere that makes a
mistake cost nothing. `claude-practice` is that somewhere.
