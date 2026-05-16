---
xp: 1
estSeconds: 150
concept: installing-the-cli
---

# Two ways in, pick the simple one

Installing the Claude CLI means downloading the program and putting it
somewhere your terminal can find it. There are two ways to do it. For
most people new to this, one is clearly easier.

## The native installer (recommended)

One command. It downloads the CLI and sets it up, with nothing to
install first:

```
curl -fsSL https://claude.ai/install.sh | bash
```

That line looks like a lot. Read it the way you read commands in the
terminal chapter: `curl` is a command that downloads something, the
web address is what it downloads (the official Anthropic install
script), and `| bash` runs that script. It's the install button, typed.

Use this one. It's the shortest path and it doesn't ask you to set
anything up beforehand.

## The npm way (if you already have Node)

The other way uses a tool called npm, which comes with Node.js, a
separate program. If you're already a Node user, this works:

```
npm install -g @anthropic-ai/claude-code@latest
```

If you don't know what Node is, you don't have it, and that's fine.
Don't install Node just for this. The native installer above skips it
entirely. The npm route only earns its place once Node is already part
of your world, which it will be later in the course if you go the
developer direction.

## Which to use

If you're following along on a Mac or Linux machine: use the native
installer, the `curl` line. On Windows, the native installer works
inside the terminal you set up last chapter as well. One command, no
prerequisites. The next step runs it.
