---
xp: 1
estSeconds: 165
concept: cat-and-echo
---

# cat reads a file. echo plus an arrow writes one.

You can make empty files. Now: putting something in them, and seeing
what's already there, without opening an editor.

## cat

`cat` prints the contents of a file straight into the terminal:

```
cat notes.txt
```

If `notes.txt` says "buy milk", the terminal prints `buy milk` and
hands you a fresh prompt. `cat` doesn't open the file in anything and
doesn't change it. It just dumps what's inside onto the screen so you
can read it fast. (The name is short for "concatenate", which is a
second thing it does that you can ignore for now.)

`cat` is most useful for a quick look. Later in the course you'll `cat`
a file to check that a command actually wrote what you expected.

## echo with an arrow

You met `echo` in lesson one: it prints its argument back to you.
`echo buy milk` just prints `buy milk` to the screen.

Add a `>` and a filename, and instead of printing to the screen, it
writes into the file:

```
echo buy milk > notes.txt
```

Nothing prints. The text went into `notes.txt`. Run `cat notes.txt`
and you'll see `buy milk` come back. The `>` is the redirect: it takes
output that would have gone to the screen and sends it into a file
instead.

One sharp edge worth knowing now: a single `>` **replaces** the file's
whole contents. If `notes.txt` already had ten lines, `echo something >
notes.txt` throws all ten away and leaves one. There's a two-arrow
version, `>>`, that adds to the end instead of replacing. You don't
need `>>` yet. Just know that one arrow overwrites, so you don't lose
work by surprise.

Try it: `echo first note > log.txt`, then `cat log.txt` to read it
back.
