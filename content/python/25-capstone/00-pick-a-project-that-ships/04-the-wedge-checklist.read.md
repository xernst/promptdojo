---
xp: 1
estSeconds: 200
concept: wedge-checklist
---

# The wedge checklist — five questions every shipped capstone passes

Step 03 named the three shapes that ship. Step 03 also hinted at
the five properties they share. This step formalizes those into
a checklist you can run against any capstone pitch in 90 seconds.
Two steps from now you'll write code that scores a pitch on
exactly these five signals. Internalize them first.

The checklist generalizes the same framework chapter 26 lesson 3
used for industry rebuilds. There it asked "which workflow inside
this business can an agent absorb?" Here it asks "which decision
inside your project can the agent own?" Same five signals, scaled
down from industry to capstone.

## 1. Volume — the agent's decision fires more than ten times a day

If the agent runs once a week, it doesn't matter how good it
gets. You won't iterate on it because the feedback loop is too
slow. You won't have enough training/eval samples to know if it
regressed. Worst of all, you'll get bored.

**Passes:** "Triages every inbound bug report from a 5-person eng
team." Bug reports show up dozens of times a day. Each one is a
decision the agent makes. **Fails:** "Drafts my annual review
self-assessment." Annual. As in once a year. Zero iteration loop.

## 2. Structured outcome — the agent's output fits a schema you can write down before you build it

Before you write a single line of code, you should be able to
write down exactly what the agent's output looks like. Not "good
analysis." Not "helpful summary." A *schema*: `{verdict: str,
priority: int, reason: str}`. Or: `category: str` from a fixed
list of 8 options. If you can't write the schema before you
build, the agent has no exit condition — and you'll know it's
"done" by vibes, which means it never is.

**Passes:** "Outputs `{label, confidence}` where label is one of
['spam', 'support', 'sales', 'other']." **Fails:** "Gives me a
helpful daily reflection."

## 3. Explicit rules — there's a written-down rubric the agent grounds in

The agent doesn't get to invent the rules. Somewhere there's a
priority rubric, a style guide, a category list, a template, or
a set of explicit checks. The agent's job is to apply those
rules consistently. If the rules live in your head, the agent
has nothing to read — and worse, you'll move the rules around
every time the output disappoints you, which guarantees the
agent never converges. Write them down first.

**Passes:** "Classifies PRs against the 12-point checklist in
`/docs/pr-style.md`." **Fails:** "Reviews PRs and gives good
feedback." Whose definition of good? Where is it written down?

## 4. Single user or team — exactly one person or team owns the output

The agent has a customer. One. Maybe a team of five. Not "every
PM in the world." Not "anyone who wants to learn faster." A
specific, named, accountable user who's on the hook to use the
output. Without this, you have no feedback channel — when the
output sucks, nobody complains, because nobody's depending on it.

**Passes:** "Triages bug reports for the CrowdTest team."
**Fails:** "Helps developers everywhere ship faster."

## 5. Observable success — you can tell from output alone whether the agent did its job

You don't need the user's emotional response to know if the
agent worked. You can look at the output, compare it against
the rubric or a held-out test set, and decide. This is the
eval-driven-development principle from chapter 19 applied at
project-design time: if you can't write an eval for it, you
can't ship it.

**Passes:** "Output category matches a human's category on a
held-out test set 90%+ of the time." **Fails:** "User feels the
recommendation was helpful." Feelings aren't testable. Held-out
sets are.

## The five together

Every shipped capstone passes all five. Most beginner projects
pass two or three and stall at the others. That's not bad luck
— it's the *cause* of the stall. The two missing checks are
exactly the work the project can't get past.

If the pitch passes all five, you have a project worth four
weekends of your life. If it passes three, narrow the scope
until it passes five. If it passes two or fewer, pick a
different project. There's no shame in throwing out a pitch at
this stage. There's a lot of shame in throwing it out at week
six, with 800 lines of half-working code and no agent to show
for it.

## Where this checklist comes from

Compressed down from the same wedge logic in Isenberg's writing
on AI-native services and the case-study framework in chapter 26
lesson 3. Same five signals as `pick_industry()` from
that lesson's checkpoint — volume, explicit rules, structured
outcomes, scoped user, observable metric. The wedge for a
two-person startup and the wedge for a weekend capstone are the
same shape, just at different scale.

Next step: a quick drill where you spot the project pitch with
the missing wedge among four that *look* fine. Then you'll
write the scorer.
