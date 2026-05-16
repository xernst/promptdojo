---
xp: 1
estSeconds: 180
concept: agent-loop-basics
---

# The agent loop: how the CLI actually works

When you give the CLI an instruction, it doesn't answer in one shot the
way a chat does. It runs a loop. Understanding this loop is most of
understanding the tool, so here it is, plainly.

The loop has four moves, repeated until the job is done:

1. **Look.** It reads the relevant files, runs a command to check
   something, or asks you a question. It gathers what it needs to know.
2. **Plan.** It decides the next concrete step. Not the whole job, just
   the next move.
3. **Act.** It does that step. Edits a file, creates one, runs a
   command.
4. **Check.** It looks at what happened. Did the file save? Did the
   command succeed or print an error?

Then it goes back to move one with what it just learned, and repeats.
Look, plan, act, check. Look, plan, act, check. That repetition is the
"agent" in "agent loop": it's not answering you once, it's working a
task until it's finished or until it needs you.

## Why the loop matters to you

A chat answers blind. It writes its best guess in one go and can't see
whether the guess worked. The CLI's loop means it sees the result of
each move before making the next one. If step three printed an error,
step four catches it, and the next plan works around it. That's why the
CLI can finish a real multi-step job: it course-corrects as it goes.

It also means the CLI is not a black box. You're not handed a finished
result with no idea how it got there. You watch the loop happen, move
by move, in your terminal. You see each file it reads and each change
it proposes. Chapter 16 of this course is entirely about agent loops,
because this pattern is the engine under every AI building tool. For
now, you just need the shape: look, plan, act, check, repeat.
