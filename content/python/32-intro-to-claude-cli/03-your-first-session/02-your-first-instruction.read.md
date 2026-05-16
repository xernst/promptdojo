---
xp: 1
estSeconds: 165
concept: first-instruction
---

# Give it something real to do

Your first instruction should be small, real, and easy to check. Here's
a good one. In the CLI session, type this in plain English and press
enter:

```
Create a file called plan.txt with three lines: one goal I have
for learning to build, one worry, and one small first step.
```

Notice what that instruction is not. It's not code. It's not a special
command with dashes and flags. It's a sentence, the way you'd brief a
capable coworker. That's the whole interface. You describe the
outcome you want, in normal words, and the CLI works out the steps.

## What makes it a good first instruction

- **It produces one file.** Easy to look at afterward and judge.
- **It's concrete.** "Three lines, this is line one, this is line two."
  A vague instruction gets a vague result. This one can't be misread.
- **It's harmless.** Worst case, you don't like the file and you delete
  it with `rm plan.txt`, a command you already know.

## The briefing skill

Here's something worth catching early. If you've ever written a clear
brief for a designer, a clear ticket for a developer, or a clear set of
instructions for a new hire, you already have the core skill for
driving the CLI. A good instruction to the CLI has the same shape as a
good brief to a person: say what you want, give the constraints, make
success checkable.

Chapter 19 of this course is entirely about this skill, called
prompting. For now, just notice that your old job probably taught you
most of it. Press enter on your instruction and watch what the CLI
does next. The following step walks through it.
