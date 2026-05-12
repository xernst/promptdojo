---
xp: 1
estSeconds: 200
concept: process-debt-and-the-incumbent-trap
---

# Case 4-5: Support ops + software dev — and the incumbent trap

We've walked through three rebuilds where a small AI-native team can
outrun a larger incumbent. Two more, briefly, before we get to the
real lesson of this chapter: **why the incumbents can't catch up**.

## Case 4: Support operations

A 40-person SaaS support team for a B2B product. Tickets flow in
through email, chat, intercom, and a community forum. Median
resolution time is 4.5 hours. CSAT is 4.1. The support manager
spends Sundays running pivot tables to figure out which agents
are slow and which categories of tickets spike.

AI-native version: a triage agent reads every inbound, classifies
it (bug / billing / feature-request / how-to), pulls the customer
account context, drafts the response, and either resolves the
ticket (for clearly-resolvable cases) or routes it to the right
human with a pre-drafted reply and a one-line summary. The support
manager builds dashboards from structured ticket data instead of
hand-coding categories. The 40-person team becomes 12 people doing
higher-leverage work (writing canned responses, designing
escalation logic, training the agent, talking to angry enterprise
customers). Resolution time drops to under an hour. CSAT goes to
4.6. The product team gets better signal because every ticket is
properly categorized.

The wedge: **classification + draft response**. Once those two
steps are agent-owned, the entire support workflow reorganizes
around them.

## Case 5: Software development (the process-debt case)

An under-credited point that's been circulating in the AI-native
discourse:

> Process debt hits hard in software dev. Using AI to code faster
> just makes you hit the QA bottleneck faster. Until humans stop
> manually running the tests, the org isn't AI-native yet.

This is the most underrated thing in the AI-native discourse.
Every dev team has been told "use Copilot, ship faster." They do.
Code velocity goes up. Then the bottleneck moves: from code
generation to code review, then to QA, then to deployment, then
to incident response. The AI-native software team isn't the one
that writes code with AI. It's the one whose **entire SDLC** —
the pipeline from "idea" to "in prod" — has been rebuilt so
agents can operate inside every step.

That looks like:

- **PR review**: an agent reviews every PR for the obvious things
  (typing, naming, test coverage, perf regressions) before the
  human reviewer sees it. Human reviewer only sees the 20% of PRs
  that need taste-level judgment.
- **Test generation**: an agent generates the test cases from the
  PR diff + prod traffic patterns + prior bug history. Coverage
  goes up without the human writing tests.
- **Deployment gates**: an agent runs the deployment checklist,
  monitors the canary, decides whether to roll back, and pages
  the human only when something is genuinely off.
- **Incident response**: an agent collects the logs, traces, and
  metric anomalies for any incident and drafts the postmortem
  skeleton. The human writes the "what we'll change" section.

A 50-person engineering org becomes a 20-person org shipping the
same surface area, because the agent absorbs everything that was
process tax. The 20 people stop being a code factory and become
a system-design team.

## The incumbent trap

Every case study above describes a 5-15-person AI-native team
outperforming a 40-100-person incumbent. The obvious question is:
**why don't the incumbents just do the same thing?**

The answer (and the reason Isenberg's writing keeps returning to
this point): **process debt**.

> The hard part is that incumbents are full of old process debt.
> Their data is messy. Their policies conflict. Their teams
> protect turf. Their workflows were built around headcount.
> Their software stack is stitched together with duct tape and
> quarterly planning rituals. Their operating system assumes
> humans are the default processors of information.

A 200-person HVAC company can't just "go AI-native." To do it,
they would need to:

1. **Clean the data.** Customer records are scattered across
   QuickBooks, a paper filing cabinet, three dispatchers' heads,
   and one tech's text messages. Cleaning that takes 6-12 months
   and no one wants to fund it.
2. **Write down the policies.** The owner's head IS the policy.
   Writing it down is months of meetings he doesn't have time for,
   and arguments about which version is the "real" policy.
3. **Restructure the team.** The four dispatchers + two AR clerks
   + two estimators don't have AI-native roles. They have to be
   reskilled or replaced. That's a political knife-fight.
4. **Replace the software stack.** The CRM, the dispatch
   whiteboard, QuickBooks, and the paper forms have to be
   replaced with a single integrated system that agents can read
   and write to.
5. **Build the eval and feedback loops.** Once agents are in the
   workflow, the company needs to measure their outputs, catch
   their mistakes, and improve the prompts. Nobody on the team
   knows how to do this.

The new AI-native company doesn't have any of this debt. They
start clean. They wrote the policies BEFORE they hired the
dispatchers. They built the data model BEFORE they took the
first customer. They designed the workflow assuming agents would
run it. Their software stack is one app, not nine.

That's the asymmetry. The new entrant doesn't have to undo
anything. The incumbent has 22 years of "ask Sarah" to dismantle
before they can even start.

## What this case study teaches (and why theory matters)

- **The bottleneck isn't AI access — it's organizational
  legibility.** Every company has access to the same models. The
  ones who win are the ones who restructured the company so the
  models have something to work with.
- **Process debt compounds in the wrong direction.** Every year
  an incumbent doesn't pay down process debt, their AI-native
  competitor gets a year of compounding advantage. By the time
  the incumbent realizes the gap, it's too late.
- **The strategic question for a founder is "what's process-debt-
  free that I could rebuild from scratch?"** Pick an industry
  where the incumbents are 30+ years old, the workflow is
  document-heavy, and the customer pays for an OUTCOME. That's
  where the next decade's wealth is going.

This is why theory matters in this course. You can drill on Python
syntax forever and not see what to BUILD with it. The reading is
how you find the wedge. The code is how you execute on it.

The remaining steps of this lesson are interactive. They take the
case-study framework and apply it to a structured "process debt
audit" you can run against a real business. By the end you'll have
a function you can paste into a notebook and use on your own job
or your own startup idea.
