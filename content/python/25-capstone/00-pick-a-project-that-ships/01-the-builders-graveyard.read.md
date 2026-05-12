---
xp: 1
estSeconds: 220
concept: capstone-project-failure-modes
---

# The builder's graveyard — what dies before it ships

This lesson is theory. Almost no code. You're about to spend the
next four lessons of this capstone building an actual agent — CLI,
real model, tools, evals, MCP. Before any of that happens, you need
to pick a capstone project that can survive contact with reality.
Most beginners don't. They pick a project that sounds exciting,
spend three weekends on it, watch it stall at 60%, and never ship.
This lesson exists so you don't do that.

The pattern is so consistent it's almost funny. Walk through any
"I built an AI agent" subreddit and count the same three or four
project ideas dying over and over:

## The four projects that always die

**The AI Twitter summarizer.** "I'll build an agent that reads my
Twitter feed and gives me a morning briefing of the important
stuff." Sounds great. Has no wedge. Volume is too low to matter
(you read Twitter in 10 minutes anyway), the success criterion is
"feels good" (no eval possible), and the rules are pure taste
("what's important?" — nobody can say). The agent generates fine
summaries on day one, you stop opening them on day three, the repo
goes stale on day five.

**The personal finance agent.** "I'll build an agent that watches
my spending and gives me budget advice." Dies on three fronts at
once: the data pipeline (your bank doesn't have an API you'd
trust), the success metric (you can't define "good advice"), and
the trust boundary (you don't want an agent making decisions about
your money, you want it to confirm decisions you've already made).
After two months you're maintaining a CSV importer and have
shipped nothing of substance.

**The research assistant.** "I'll build an agent that does deep
research for me — gathers sources, synthesizes, cites." This one
dies the slowest, which is what makes it so dangerous. It feels
like it's working. It even *kind of* works on the first three test
queries. Then you hit the long tail: hallucinated citations,
paywalled sources, ambiguous queries, conflicting sources. The
eval question is unanswerable ("is this research good?") so you
can't tell if you're improving. You ship a demo, never a product.

**The "do everything" personal assistant.** "I'll build an agent
that manages my calendar, my email, my tasks, and reminds me to
drink water." This is the platonic ideal of a project with no
wedge. There's no single decision the agent makes that matters
enough to optimize. There's no single failure that's bad enough to
write an eval for. There's no user other than you, so there's no
feedback. After a month the agent does five things badly instead
of one thing well.

## What's missing from all four

The same three things. Every time:

1. **No wedge.** No single, high-volume, structured decision the
   agent owns. Without a wedge, every feature is bolt-on, and
   bolt-on agents have no reason to be agents — they're chatbots
   with extra steps.
2. **No eval.** No way to know if today's output is better than
   yesterday's. Without an eval, you can't iterate. Without
   iteration, the agent stalls at "kind of works" and never gets
   shipped to a second user.
3. **No exit condition.** No clean answer to "when is this done?"
   These projects sprawl forever because every new failure case
   suggests a new feature. The graveyard is paved with
   80%-complete personal assistants.

Greg Isenberg's writing on AI-native services makes the broader
version of this point: the wedge isn't "use AI somewhere." The
wedge is a specific, high-volume, rule-bound decision that the
agent owns end to end. Chapter 26 lesson 3 walked you through
five industries where the wedge was
visible at the workflow level. We're going to do the same thing
at the *project* level now.

## The hard truth about capstones

The capstone you build at the end of a course is not the agent
you'll use forever. It's the agent that proves you understand the
loop. If you pick a project with no wedge, you'll spend your
energy on the wrong battles — fighting your data pipeline,
fighting your prompt, fighting your eval — and never actually
exercise the pattern this course was built to teach.

If you pick a project with a wedge, even a tiny one, every part
of the next four lessons falls into place. The tool schemas write
themselves. The eval is obvious. The exit condition is built into
the spec. You finish in a weekend.

That's the difference between projects that ship and projects
that don't. Not ambition. Not skill. Not even time. **Wedge or
no wedge.**

## What the rest of this lesson does

The next six steps will:

1. Show you four capstone pitches and have you pick the one with
   the real wedge.
2. Name the three shapes of project that consistently ship,
   illustrated with Josh's own projects — promptdojo (you're using
   it right now) and CrowdTest.
3. Give you a five-question wedge checklist that any capstone has
   to pass.
4. Drill you on the checklist with a "spot the missing wedge"
   exercise.
5. Have you write `score_project(spec)` — a function that scores
   any project pitch against the wedge checklist.
6. Checkpoint with `pick_capstone(candidates)` — the function you'll
   use on yourself before you start the build.

By the end you'll have written a tool that prevents you from
building any of the four graveyard projects above. Use it on
yourself. Use it on your friends. Use it on every "I'll build an
agent that..." idea you have for the rest of your career.
