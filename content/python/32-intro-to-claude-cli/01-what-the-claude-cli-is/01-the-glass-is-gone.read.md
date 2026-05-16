---
xp: 1
estSeconds: 150
concept: cli-vs-chat-core
---

# The chat is behind glass. The CLI isn't.

Picture how you use Claude in a browser tab today. You ask a question.
It writes you something good. Then you do the actual work: you select
the answer, copy it, switch to another app, paste it, fix the spots
that didn't quite fit. The model did the thinking. You did the moving.

That copy-paste step is the glass. The chat can produce anything but it
can't place anything. It has no hands.

The Claude CLI is the same Claude model, running in your terminal,
with its hands on the folder you started it in. When you tell the CLI
"create a file called notes.txt with these three lines," it doesn't
hand you the text to paste. It creates the file. When you say "this
folder has five files, rename them to lowercase," it renames them.

Here's the same task, both ways:

| | Chat | CLI |
| --- | --- | --- |
| You ask | "write me a budget template" | "create budget.txt with a budget template" |
| It returns | the text of a template | the file `budget.txt`, sitting in your folder |
| You then | copy, open an app, paste, save | check that you like it |

Same intelligence. The difference is whether you're left holding the
output or whether the output already landed where it belongs.

This matters most when the work is not one file but twenty, not one
step but a sequence. Copy-pasting twenty times is where the chat stops
being worth it. The CLI doesn't get tired at twenty, or at two hundred.

You don't give anything up by learning the CLI. The chat is still
there, still useful, and the next lesson is about keeping both. But the
glass is the thing this chapter removes.
