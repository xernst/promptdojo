---
xp: 1
estSeconds: 240
concept: scarce-profile-at-the-intersection
---

# Who's scarce in 2026

There are two skills that hiring managers are paying for right now.
One is **writing prompts that don't waste tokens or produce garbage**.
The other is **writing code that doesn't fall over when the model
hallucinates inside it**. Almost everyone can do one. Almost nobody
can do both.

That intersection — prompt fluent AND code fluent — is the niche this
course is aimed at. It is small. That's why it pays.

> Every AI feature shipping today needs someone who reads outputs like
> a paralegal reads a contract. That person is rare. That person is
> you, plus six weeks.

## The role spectrum

The intersection isn't a single job. It's a spectrum. Different
chapters of this course serve different end-states on it.

- **Prompt engineer.** The most accessible role. You write, version,
  and grade prompts. Less code, more language. The chapters that
  matter most: ch01-04 (basic Python so you can read code), ch13
  (LLM APIs), ch19 (prompting), ch21 (evals). AI-engineering roles
  span a wide range: junior in-house roles cluster lower, senior or
  agency roles cluster higher. We won't quote a specific salary band —
  the market has been moving every quarter — but most of the public
  hiring data (LinkedIn Workforce Reports, Levels.fyi) shows the
  AI-skilled premium is real for senior engineers and unclear at the
  junior level. Treat any specific dollar number you read from a
  course or a recruiter as an aspirational data point, not a guarantee.
- **Eval engineer.** The role that grew out of "the prompts are good
  but how do we know?" You write graders, build test sets, run
  regression tests against new model versions. The chapters that
  matter most: ch11 (classes), ch14 (structured output), ch20 (agent
  traces), ch21 (evals). This is the most underrated role in the
  market right now.
- **Agent builder.** You wire models into loops, tools, and
  retrieval. You build the thing that actually runs. The chapters
  that matter most: all of ch12-25. The bulk of the course aims here.
- **Harness engineer.** The advanced role. You build the scaffolding
  that makes agents reliable in production — the retry logic, the
  observability, the cost guards, the failover. Chapters: ch22-30.
  Almost nobody has done this for two years yet, because the role
  didn't exist two years ago. Top of the market.

You do not need to pick one now. Most people end up sliding along the
spectrum as they learn what they're good at. The course is built so
that finishing ch01-21 puts you in prompt engineer or eval engineer
range, ch01-25 puts you in agent builder range, and ch01-30 puts you
in harness engineer range. Each tier is a real job.

## The "differently technical" advantage

If you came from copywriting, support, paralegal work, or design —
you already do something that most engineers can't:

- You can read a paragraph and tell whether it's lying. Engineers
  often can't. They check syntax, not semantics.
- You can write a brief that another human can actually execute.
  Engineers often can't. They write specs for compilers, not people.
- You have tolerance for ambiguous, judgment-driven, partly-subjective
  work. Engineers often don't. They want type signatures.

Those three skills are exactly what eval engineering and prompt
engineering are. You are not catching up to engineers. You are
adding their layer to a skill set they don't have.

> By chapter 30 you won't be "using AI." You'll be the person other
> engineers ask how to use it.

If you came from engineering — you have the inverse advantage. You
can already read tracebacks, ship to production, reason about
concurrency. The thing you're adding is the language layer: the
discipline of writing prompts that don't waste the model and reading
outputs like a paralegal reads a contract. That's why your path
through the course skips different chapters than the copywriter's
path does. We'll map both paths in the next two lessons.

## What this means concretely

The market does not pay for "I learned Python." It pays for "I can
ship the thing that does the job you used to pay a junior to do."

Every chapter of this course is calibrated to that bar. By the time
you finish, you should be able to point at a workflow at a company
and say: "I could rebuild that as an agent. Here's what it would
cost. Here's how I'd grade whether it works."

That sentence is what the intersection sounds like out loud. We're
going to get you there.
