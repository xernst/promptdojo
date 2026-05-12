---
xp: 1
estSeconds: 220
concept: agent-commits-without-review
---

# Disaster 3: The "git add ." era — AI agents committing without a human in the loop

From mid-2024 onward, AI coding assistants started doing
something genuinely new in the git workflow: they began
**committing on your behalf**. Cursor's Composer would make a
multi-file edit and run `git add .` followed by `git commit -m
"Done."` without pausing. Codex CLI scripts ran end-to-end
pipelines that included pushes.

The training data for these agents is full of `git add .`. It's
the most common pattern in tutorials, in StackOverflow answers,
in beginner courses. So the agents reach for it. And `git add
.` stages everything in the working tree — your source changes,
your scratch files, your `.env`, your `secrets.json`, your IDE
config, your virtualenv if your `.gitignore` is incomplete.

GitGuardian's 2024 and 2025 secret-sprawl reports counted **more
than 23 million credentials leaked to public GitHub in 2024
alone**, with year-over-year growth specifically attributed to
"developer use of generative-AI tools that commit and push
without human review." Their published top-ten leak types in
2024 included OpenAI API keys (which became valuable enough to
script-scan for the moment GitHub indexed a new commit), AWS
keys, Stripe keys, and database connection strings.

## What actually failed

For thirty years, the customs officer at the border between your
laptop and the public internet was *you*. You ran `git status`.
You ran `git diff`. You looked at what was about to ship and you
either added it or you didn't. The agent era removed the customs
officer.

The chain that fails in the agent commit:

1. **The agent runs `git add .`** without filtering. Every
   modified file gets staged. If you generated a `.env` while
   debugging, it's now staged.
2. **The agent commits without showing you the diff.** The
   default UX is "I made these changes, do you want me to
   commit them?" — phrased as a yes/no, not as "here's the
   diff, scroll through it."
3. **The agent pushes.** Often in the same breath as the
   commit. Once pushed to a public repo, the secret is gone —
   force-pushing over it doesn't erase git history from
   GitHub's reflog, and credential-scraping bots index new
   commits within seconds.
4. **The human reviews after the fact, if ever.** By the time
   you notice, your key is already being used to spin up
   mining instances on your AWS account.

The load-bearing failure is step 2. The diff isn't being shown.
Even attentive humans get into the habit of typing "y" on the
agent's prompts without reading them.

## A specific recurring failure pattern

Here's the exact form this takes in the wild. A developer asks
Cursor to "set up the env file and add the database connection
string." Cursor creates `.env`, writes the connection string
into it, and runs `git add .` to stage the new files. The
developer's `.gitignore` *should* have `.env` in it. Frequently
it doesn't, because they're working in a fresh repo or one
where someone forgot to add the line. The agent's auto-commit
runs. The push lands on a public GitHub repo. A scraping bot
sees it within 30 seconds. By morning, somebody else is querying
the database.

This isn't hypothetical. There are dozens of public OSS
projects whose commit history shows exactly this pattern,
followed by a `git filter-branch` cleanup commit hours later
(which doesn't actually remove the secret from GitHub's
servers). The right move at that point is rotation, not
rewriting history. You can't un-publish.

## The control chain that would have caught it

- **Configure the agent's gitignore behavior**. Both Cursor and
  Claude Code support project-level config that restricts what
  the agent can stage. Setting "never stage files matching
  `.env*`, `*.pem`, `*.key`, `id_rsa*`, or anything in
  `secrets/`" is the cheapest, earliest, most reliable control.
  This is the one you should have set yesterday.
- **Require an explicit human approval step on every commit
  that includes new files.** Modify the agent prompt so it
  always pauses with `git diff --cached` shown before running
  `git commit`.
- **Enable GitHub's push protection** at the org and repo
  level. It scans every push for known secret patterns and
  rejects the push if one is detected. Free, on by default for
  new repos in many orgs as of 2024.
- **A pre-commit hook on your machine** that runs `gitleaks` or
  `trufflehog` against staged content. Same control as in the
  Uber case — the secret-scanning hook is doing 80% of the work
  in every disaster in this lesson.

These compound. If you have all four, the only way a secret
ships is if all four fail at once.

## What got rotated

There's no single big-name incident here. The "rotation" is
ongoing: developers individually rotating keys after they push
them, GitHub scaling up its secret-scanning service to handle
the increased rate, AWS and Stripe and OpenAI building automatic
key-revocation pipelines for secrets they detect in public
commits (yes, OpenAI auto-revokes keys it finds in public
repos — they've been doing this since 2023, and you'll get an
email).

The collective annual cost: nobody knows precisely. GitGuardian's
estimate puts it in the hundreds of millions of dollars in
combined remediation, cloud-bill abuse, and incident response,
just from agent-committed secrets, just in 2024.

## What you should take from this

You are now in an era where the agent will commit on your
behalf. The agent does not know what is in your `.env`. It
does not understand the legal consequences of a leaked Stripe
secret. It cannot tell that the file it just staged contains a
customer database password. **You are the only thing in the
loop that can.**

The reflex you need to build is one keystroke long: every time
the agent says "I committed," type `git show HEAD` before you
type anything else. If you don't recognize a file, you have a
problem. Fix it before the agent pushes.

The next steps drill this reflex.
