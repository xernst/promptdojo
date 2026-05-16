---
xp: 1
estSeconds: 150
concept: reading-the-prompt
---

# Reading the line before you type

Look at your open terminal. There's a line of text ending in a blinking
cursor. That line is called the **prompt**. Not the kind of prompt you
write for an AI. This is the older meaning: the computer is prompting
you, as in waiting for you, to type something.

A typical Mac prompt looks like this:

```
maya@macbook ~ %
```

Reading it left to right:

- `maya` is the username. Yours will be your account name.
- `macbook` is the computer's name.
- `~` is where you currently are in your files. The `~` symbol is
  shorthand for your home folder. More on that next lesson.
- `%` is just the punctuation that marks the end of the prompt. On
  Windows you'll often see `>`, on some setups `$`. It's a finish line,
  nothing more.

After the `%` (or `>` or `$`) is where your typing goes.

## Type your first command

In the terminal, type this exactly, then press enter:

```
whoami
```

The terminal prints your username back at you and then shows a fresh
prompt, ready for the next thing.

```
maya@macbook ~ % whoami
maya
maya@macbook ~ %
```

That's the full loop you'll repeat all day: there's a prompt, you type
a command, you press enter, the computer answers, a fresh prompt
appears. `whoami` is the gentlest possible command. It changes nothing.
It just asks the computer "who am I logged in as" and the computer
answers. You've now run a real terminal command. The first one is
behind you.
