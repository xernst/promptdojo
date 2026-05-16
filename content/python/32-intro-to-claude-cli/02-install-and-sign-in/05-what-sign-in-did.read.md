---
xp: 1
estSeconds: 165
concept: authenticating-the-cli
---

# What that sign-in actually did

You clicked approve in a browser and the terminal said you're in. It's
worth thirty seconds to understand what happened, because this same
pattern shows up everywhere once you start building.

The flow you just did has a name: an **OAuth** sign-in. Stripped down:

1. The CLI couldn't prove who you were, so it sent you to a place that
   could: Anthropic's own sign-in page, in your browser.
2. You proved it there, on a page you trust, by being logged in and
   clicking approve. The CLI never saw your password. It didn't need
   to.
3. Anthropic handed the CLI a **token**: a long generated string that
   means "this CLI is allowed to act as this person." The CLI saved
   that token on your machine.

From now on, the CLI shows that token instead of asking you to sign in
again. That's why it's a one-time step.

## Why this is the safe way

The thing that makes OAuth good: the CLI never handled your password.
A tool you just installed should not be trusted with your password,
and with OAuth it never is. It only holds a token, and a token can be
switched off from your account settings without changing your
password. If you ever wanted to revoke the CLI's access, you'd do it
there, and your password would be untouched.

You'll see this exact pattern again. When you connect tools to each
other later in the course, "sign in with your account in a browser,
approve, the tool gets a token" is the normal, safe shape of it. You
just did it once, by hand, so the pattern isn't a mystery later.
