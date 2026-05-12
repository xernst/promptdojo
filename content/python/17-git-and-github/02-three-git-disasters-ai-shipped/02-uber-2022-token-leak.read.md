---
xp: 1
estSeconds: 220
concept: uber-2022-credentials-in-repo
---

# Disaster 1: Uber, September 2022 — AWS credentials in a private repo

September 15, 2022. Uber's internal Slack lights up with a
message that opens with "I announce I am a hacker and Uber has
suffered a data breach." The poster, an 18-year-old later
attributed to the Lapsus$-adjacent crew, had pivoted from a
single contractor's compromised credentials all the way into
Uber's internal admin tools, AWS console, GCP console, financial
dashboards, and the company HackerOne account.

The pivot path is the part this lesson cares about. After getting
past MFA via push-fatigue on the contractor, the attacker browsed
Uber's internal network and found a **PowerShell script on a
network share**. Inside that script: hardcoded admin credentials
for Thycotic, Uber's privileged access management tool. From
Thycotic the attacker grabbed secrets for AWS, GCP, Duo,
OneLogin, and the SentinelOne management console.

The script with the hardcoded credentials was in a repository.

## What actually failed

This wasn't one mistake. It was a chain of them, but the chain
*started* with a single Class-1 control failure: **a secret was
in version control at all.** Every other control downstream had
to compensate for that fact. None of them did, completely.

Walk the chain:

1. **The script was committed with the secret in it.** No
   pre-commit hook scanned for credentials. No reviewer flagged
   the hardcoded value. The script worked, so it shipped.
2. **The script lived in a repo accessible from the corporate
   network.** No isolation. Anyone who got onto the network got
   the script.
3. **The credential it hardcoded was a privileged-access-manager
   admin account.** One leaked credential cascaded into every
   other system in the company.
4. **The credential was not rotated on any schedule.** Once
   committed, it stayed valid indefinitely. Git history is
   forever — even if someone had deleted the line later, the
   secret was still recoverable from the commit log.

## The control chain that would have caught it

Working backward from "attacker downloads all of Uber's cloud
credentials" to the earliest point a control could have broken
the chain:

- **Mandatory rotation on a 30-day cadence.** Would have made the
  committed credential stale by the time it was used. Backstop,
  not prevention.
- **Privileged-access-manager scoped to specific machines, not
  network-wide.** Would have limited blast radius. Backstop, not
  prevention.
- **Code review by a human who knew "we don't hardcode creds."**
  Would have caught it IF the reviewer noticed. Reviewers miss
  these constantly. Weak.
- **`.gitignore` entries for `*.config`, `*.ps1.local`, etc.**
  Only helps if the developer put the secret in a separate file.
  This script had it inline. Useless here.
- **Pre-commit hook that scans staged content for credential-
  shaped strings.** Would have failed the commit before it left
  the developer's laptop. This is the earliest mechanical
  control in the chain.
- **Architectural rule: secrets read from environment variables
  or a vault at runtime, never present in source.** If the
  script literally cannot work with an inline credential, the
  developer can't commit one even if they want to.

The last two are the wedge. Everything else is compensating
controls.

## What got rotated

Uber's incident response, per their public writeup and the FTC
case that followed: all credentials in the compromised PAM
rotated, AWS and GCP access keys rotated, OneLogin SSO
rotated, internal certificates reissued, employees forced to
reauthenticate on every device, the contractor's account
destroyed and rebuilt, and a multi-month audit of every repo
in the org for additional embedded secrets.

That audit found more. It always does. Companies that run a
real secret-scan against their full git history for the first
time always find embedded credentials they didn't know about.
GitGuardian's 2025 State of Secrets Sprawl report found that
35% of private repos contain plaintext secrets.

## What you should take from this

The cost of the breach to Uber: 8-figure regulatory and legal
exposure, an FTC consent order, executive turnover, months of
remediation, and the brand damage of being the rideshare
company that got popped by a teenager.

The cost of preventing it: a pre-commit hook (`gitleaks`,
`trufflehog`, GitHub's built-in push protection — all free) and
an architectural decision to never read secrets from anywhere
but the environment or a vault. Engineering effort: maybe four
hours.

The asymmetry is brutal. The cheapest possible control prevents
the most expensive possible outcome. Every breach you read about
will have this shape.

When Cursor or Claude Code runs `git add .` in your repo, your
brain should reflexively pattern-match to "Uber 2022." Then you
should check the diff.
