---
xp: 1
estSeconds: 150
concept: account-vs-api-key
---

# Account sign-in vs API key: when each one is for

You signed in with your Claude account. You'll keep hearing about "API
keys" as a different way in. Here's the difference, settled in one
step, so the words stop being noise.

## Account sign-in (what you did)

You, a human, at your own machine, working interactively. You sign in
once through the browser, your existing Claude plan covers the usage,
and you're done. This is the right path for everything you do in this
course. If you're a person typing at a terminal, this is your path.

## API key

An **API key** is a single long secret string that stands in for the
browser sign-in. No browser, no clicking approve. A program just
presents the key and gets access.

That sounds simpler, so why isn't it your path? Because the API key is
built for situations where no human is present to click anything:

- A program on a server that runs every night at 3am.
- An automated job inside a pipeline, covered late in this course.
- A tool that calls Claude on its own, with no person in the loop.

An API key also bills differently, by usage against a console account,
which is the right model for automated jobs and the wrong model for a
person learning at a terminal.

## The rule

If a human is sitting there, use the account sign-in. If a program
runs unattended, that's when an API key earns its place. You're a human
sitting there. You already did the right thing. When the course reaches
automated jobs, you'll meet API keys properly, and chapter 18 covers
how to handle secrets like them safely. Until then: you're set.
