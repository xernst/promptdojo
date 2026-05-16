---
xp: 1
estSeconds: 150
concept: command-anatomy
---

# A command has parts, like a sentence

`whoami` is one word, so it hides something. Most commands have parts.
Knowing the parts means you can read any command someone hands you,
including the ones an AI tool will hand you later.

A command is built like a short instruction:

```
command   argument
```

- The **command** is the verb. The thing to do. `ls`, `cd`, `mkdir`.
- The **argument** is what to do it to. A folder name, a file name,
  some text.

Try one with an argument. Type this and press enter:

```
echo hello
```

`echo` is a command that means "print this back to me." `hello` is the
argument, the thing to print. The terminal prints:

```
hello
```

Change the argument, get a different result. `echo your name here`
prints your name. The command stayed the same; the argument changed
what it acted on.

## Some commands take options too

You'll also see short flags, usually a dash and a letter, like `ls -l`.
Those are **options**. They tweak how the command behaves. You don't
need them yet. Just know that if you see `ls -l` later, `ls` is still
the command, and `-l` is a setting that says "give me the long,
detailed version."

So the full shape, when everything's present:

```
command   -option   argument
```

Verb, setting, target. Read any command in that order and it stops
looking like code and starts looking like a sentence: "list, the long
way, this folder."
