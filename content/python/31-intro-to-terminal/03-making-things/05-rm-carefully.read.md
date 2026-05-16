---
xp: 1
estSeconds: 165
concept: rm-and-no-undo
---

# rm deletes. There is no trash can.

One more command, and it's the one command in this chapter that needs
real care. Not because it's hard. Because it's blunt.

## rm

`rm` stands for "remove." It deletes a file:

```
rm notes.txt
```

`notes.txt` is gone. Here's the part that matters: it is gone *gone*.
When you delete a file in your normal file window, it goes to the
Trash or Recycle Bin, and you can fish it back out. `rm` does not do
that. There is no trash can in the terminal. `rm` deletes the file for
real, immediately, with no confirmation and no undo.

This is not a reason to be afraid of `rm`. It's a reason to read the
line before you press enter. That's the whole safety rule:

> Before you run `rm`, read what comes after it out loud. If you're not
> sure you want that exact thing gone forever, don't press enter.

## Why it works this way

It's fair to ask why a tool would skip the safety net. The answer is
the same theme as the whole chapter: the terminal is built for
repeatable, scriptable work. A command that stopped to ask "are you
sure?" every time couldn't be used to clean up a thousand files in one
go. The terminal trusts you to mean what you typed. That trust is
powerful and it's also why you read the line first.

## What to actually do

For now, in this course, you'll rarely need `rm`. When you do:

- Delete one named file at a time: `rm oldfile.txt`. Specific, calm,
  easy to check.
- Be extra careful with `*`, a wildcard that means "everything
  matching." `rm *.txt` deletes every `.txt` file in the folder. That's
  a real tool, but it's not a lesson-three tool. Avoid `*` with `rm`
  until you're comfortable.
- If you ever feel unsure, run `ls` first to see exactly what's in the
  folder, then delete the one named thing you meant.

Respect `rm`, don't fear it. Read the line, then press enter.
