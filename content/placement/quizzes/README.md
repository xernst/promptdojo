# Path quizzes (Task 5)

Ten path-specific placement quizzes, one per career path. A learner takes the
quiz for their chosen path after the general survey. The quiz decides which
chapters in that path they can skip ahead on.

## Files

| File | Path | Questions | maxScore |
|---|---|---|---|
| `developer.json` | Developer | 10 | 20 |
| `marketer.json` | Marketer | 8 | 16 |
| `designer.json` | Designer | 8 | 16 |
| `customer-service.json` | Customer Service | 8 | 16 |
| `copywriter.json` | Copywriter | 8 | 16 |
| `data-analyst.json` | Data Analyst | 8 | 16 |
| `project-manager.json` | Project Manager | 8 | 16 |
| `hr-specialist.json` | HR Specialist | 8 | 16 |
| `operations.json` | Operations | 10 | 20 |
| `lawyer.json` | Lawyer | 8 | 16 |

Each quiz tests the 4 or 5 most important chapters of its path, drawn from
`docs/plan/CAREER-PATHS.md`. Each tested chapter gets 2 scenario-based questions.

## Scoring

Same model as the general survey: single-select, sum the points on the chosen
options. Each question is worth 2 points (the correct option scores 2, wrong
options score 0; a small number of near-miss options score 1). Every question
declares its `correctOptionId`.

Each quiz file carries its rule in the `scoring` block.

## Skip logic

Two outputs come from one quiz.

1. **Per-chapter skip** (`skipLogic.byChapter`). Each tested chapter has 2
   questions. If a learner answers **both correctly**, they place out of that
   chapter: it starts in Version B for them, and its Version A is skipped. Miss
   either question and the chapter starts where the general survey put them.

   "Both correct" is deliberately stricter than a 50 percent per-chapter rule.
   Placing out of a chapter should mean the learner demonstrated the concept,
   not half-demonstrated it. If the platform prefers a looser bar, changing
   `skipVersionAIf` to `"at least one correct"` is a one-field edit per chapter.

2. **Overall default** (`scoring.overallSkipThreshold`). If a learner scores
   50 percent or more of the quiz's maxScore, Version B is the recommended
   default for the path's chapters they did not individually place out of.
   Below 50 percent, those chapters follow the general survey's placement.

## How a learner moves through placement

1. Pick a path.
2. Take the **general survey** (`../general-survey.json`). It sets the global
   Version A or Version B starting point.
3. Take this **path quiz**. It overrides that starting point per chapter:
   chapters placed out of are skipped or started at Version B.
4. At any time, in any chapter, the learner can switch versions or revisit a
   skipped chapter. Placement is a starting point, never a lock.

## Schema note

As with the general survey, this JSON shape is a content-team proposal, not a
platform-provided spec. Field names and structure are easy to change if the
Platform team wants something different. Flag it and these files get reshaped.
The questions, points, and skip rules are the real content; the wrapper around
them is negotiable.
