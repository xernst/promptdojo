# Placement: surveys, quizzes, and routing

This folder holds the placement content the platform uses to route a learner
into Version A (beginner) or Version B (intermediate) chapters.

- `general-survey.json` is the Task 4 deliverable. One survey everyone takes
  after picking a path. Sets the global A/B starting point.
- `quizzes/*.json` is the Task 5 deliverable. One quiz per career path, deciding
  which chapters in that path a learner can skip ahead on.

## Schema note (read this first, Platform team)

There is no platform-provided file spec yet. The JSON schema used here is a
**content-team proposal**. It is deliberately plain and self-documenting so it is
easy to adopt or adjust. If the platform wants different field names or a
different shape, that is a quick mechanical change to these files. Flag it and we
will reshape. Nothing about the content depends on the exact field names.

## General survey scoring (Task 4)

`general-survey.json` is 13 questions, each worth a maximum of 4 points.

- **maxScore: 52** (13 questions x 4 points).
- Each option carries a `points` value. Single-select. A learner's score is the
  sum of the points on the options they chose.
- **Threshold: 26 points (50 percent).**
  - Score **>= 26** -> **Version B** start (faster, less hand-holding).
  - Score **< 26** -> **Version A** start (slower, full hand-holding).

The scoring block is embedded in the JSON under `scoring`, so the platform reads
the rule from the file rather than hard-coding it.

### Why the points are shaped this way

- Pure "have you used X" questions scale 0 to 4 with usage frequency.
- Knowledge questions (what is a variable, what does `cd` do) are 4 for the
  correct answer, 0 otherwise. There is no partial credit for a wrong model.
- Scenario questions reward the answer that shows real understanding, not the
  one that sounds careful. "Ask the AI if it is sure" scores low because it is
  not verification.
- An honest "I am not sure" always scores 0. It is never punished beyond that,
  and it is the right answer to pick when true. Guessing high only earns a
  learner chapters that move too fast.

### Recommended placement rules

1. **Binary by default.** 26+ is B, under 26 is A. Simple and predictable.
2. **Borderline band (recommended add-on for the platform).** Scores of 24 to 28
   sit close to the line. Recommendation: place by the threshold as normal, but
   on the first chapter show these learners a one-line nudge: "This felt close.
   If the pace is off, switch versions at the top of any chapter." This is a UX
   suggestion, not a scoring change.
3. **Always reversible.** Whatever the survey decides, the learner can switch A/B
   at any time from the chapter view. The survey sets a starting point, not a
   verdict. Copy throughout treats it that way.
4. **No path weighting here.** This survey measures general AI and coding
   baseline only. Path-specific skip-ahead is the job of the Task 5 quizzes.

## Path quiz scoring (Task 5)

See `quizzes/README.md` for the per-path quiz scoring and skip logic.
