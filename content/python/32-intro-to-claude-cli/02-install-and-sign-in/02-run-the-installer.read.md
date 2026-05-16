---
xp: 1
estSeconds: 165
concept: installing-the-cli
---

# Run it, then check it

Open the terminal from last chapter. Type the installer command and
press enter:

```
curl -fsSL https://claude.ai/install.sh | bash
```

The terminal prints a few lines as it downloads and sets things up.
This takes under a minute. When it finishes, you get a fresh prompt.

## Confirm it worked

Don't trust "it didn't error." Check directly. Type:

```
claude --version
```

If the install worked, this prints a version number, something like:

```
2.x.x (Claude Code)
```

A version number means the CLI is installed and your terminal can find
it. That's the whole confirmation. `--version` is an option (you met
options in the terminal chapter, a dash and a word that adjusts a
command). It tells `claude` to just report its version and quit, which
makes it a safe "are you there" check.

## If it didn't work

The most common snag: you run `claude --version` and the terminal says
something like `command not found: claude`. That almost always means
the CLI installed fine but the terminal hasn't noticed it yet.

The fix is usually the simplest possible one: close the terminal
window completely and open a fresh one. A terminal checks for available
commands when it starts, so a brand-new window sees the freshly
installed `claude`. Run `claude --version` again in the new window.

If a fresh window still says `command not found`, that's a real
install issue, and Anthropic keeps a troubleshooting page for exactly
this. But nine times out of ten, the fresh window is the fix. Try that
first before assuming anything is broken.
