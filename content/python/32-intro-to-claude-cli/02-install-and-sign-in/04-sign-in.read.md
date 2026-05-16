---
xp: 1
estSeconds: 150
concept: authenticating-the-cli
---

# Sign in

The CLI is installed, but it doesn't know who you are yet. It needs to
connect to your Claude account before it can do anything. That's a
one-time sign-in. Type:

```
claude auth login
```

Two things happen:

1. Your web browser opens to a Claude sign-in page. If you're already
   signed in to Claude there, it may just show a confirmation screen.
2. The page asks you to approve the CLI's access. You click approve.

That's it. The browser shows a "you can close this tab" message, you
go back to the terminal, and the CLI is now signed in as you.

You can also just type `claude` and start a session; if you've never
signed in, it walks you through the same flow on first run. Either way
gets you to the same place.

## You won't be asked for an API key or a card

If you've read anything about using AI tools "through an API," you may
be bracing for an API key, a billing setup, a credit card. For signing
in as an individual, none of that. You sign in with the same Claude
account you use in the browser. Your existing plan covers it.

API keys are a real thing and they have real uses, mostly for running
this stuff on servers or inside other programs, and the next step
explains where they fit. But for you, on your own machine, today: a
browser sign-in with your normal account, and you're in.

Run `claude auth login` now and complete the browser step. The next
two steps explain what that sign-in actually set up.
