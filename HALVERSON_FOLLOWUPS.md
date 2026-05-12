# Halverson Audit — Deferred Structural Fixes

**Reviewer**: Dr. Marcus Halverson (adversarial persona — tenured CS prof, 30 years teaching displaced/non-traditional adult learners)
**Review date**: 2026-05-12
**Reviewed against**: commit `2b4b066` (post 6-agent fact-check pass)

The "normal" mechanical fixes from Halverson's review were applied separately. The items below are deferred because each requires structural rewriting, pedagogical re-thinking, or a corpus-wide voice pass — not surgical text edits.

---

## SHIP-BLOCKER for the re-education positioning

### H-#1 — Ch00 exercise scope violates its own promise

All 4 write/checkpoint exercises in ch00 demand function-writing using concepts (`def`, dicts, loops, conditionals) that aren't introduced until ch02–ch05.

**Files:**
- `content/python/00-before-you-build/01-the-situation-named-honestly/07-checkpoint.checkpoint.yaml` — demands `def inventory(skills)` with iteration + dict-mapping
- `content/python/00-before-you-build/02-what-an-llm-actually-is/08-write-the-next-token-predictor.write.yaml` — `max(..., key=...)` + f-string formatspec
- `content/python/00-before-you-build/03-how-to-talk-to-one/07-structure-the-vague-prompt.write.yaml` — `def` + list-of-fstrings + `"\n".join`
- `content/python/00-before-you-build/04-where-this-course-goes/07-write-your-30-day-plan.write.yaml` — branching + integer division + conditional logic + multi-key dict construction

**Why this is a ship-blocker for displaced-worker positioning:**
Lesson 01 explicitly tells the student that quitting in week 1 is the failure mode the course is designed against. Then ch00 lesson 01's checkpoint asks them to write a function before they have been told Python contains functions. The manufactured failure happens exactly where ch00 said it wouldn't.

**Fix options (decision needed):**
- **(a)** Replace with non-code conceptual drills (drag-and-drop, fill-in-blank, predict-the-output, sketch the layers, label the parts)
- **(b)** Move the function-writing to a single capstone checkpoint at the end of ch05 once prereqs exist
- **(c)** Provide a fully scaffolded skeleton; student fills 1–2 expressions
- **(d)** Strip the checkpoints from ch00 entirely; ch00 becomes purely conceptual

Halverson's recommendation: (a) or (d). Probably (a) for engagement.

---

## Voice + tone overhaul (corpus-wide)

### H-#15 — One voice across 31 chapters

The cadence of ch00 = cadence of ch30. Em-dashes everywhere, "Pattern:" / "The fix:" / "X, not Y" reversal headers, "Read it twice" rhetorical beats. The displaced-copywriter audience the course claims to serve is the audience least able to be fooled by this — they'll recognize one generated voice in 90 minutes.

**Required**: a human voice-pass editor, OR deliberate per-chapter tone differentiation (ch00 quieter+slower, ch24 punchier, ch29 terser, ch30 denser).

### H-#5 — Aphorism count is load-bearing on tweets that can't bear the load

Examples Halverson flagged:
- "the math changed" — `00-before-you-build/01-…/01-the-math-changed.read.md`
- "harnesses don't shrink, they move" — `30-harness-engineering/05-…/04-…`
- "Agent = Model + Harness" — `30-harness-engineering/…`
- "Different surface, same medicine" — `24-debugging-output/04-five-real-postmortems/06-…`

Halverson's rule: any phrase that gets a blockquote treatment should have to earn it by saying something the surrounding paragraph couldn't say in literal language. Half of the blockquoted aphorisms fail this test.

**Required**: cut aphorism count by ~70%. Drop the blockquote treatment from anything that's just a tweet rather than a load-bearing claim.

---

## Consistency passes

### H-#7 — Anthropomorphism whiplash

Ch00 lesson 02 explicitly inoculates against "the model thinks / it understands / it's lying" mental models. By ch26/30 the curriculum casually drops the discipline:

- ch26 `02-…/01-intro.read.md` — "the agent doesn't fail because the model is dumb"
- ch30 lesson 04 — "the model thinks fine"
- ch30 lesson 05 — "The model has never seen `RunShell`. It will still figure it out; LLMs are flexible."

**Fix**: either consistently use intentional-stance shorthand with an explicit "this is shorthand" reminder, OR consistently avoid. Decide which, then propagate corpus-wide.

### H-#9 — RAG/long-context/fine-tune trichotomy presented as settled science

`22-context-and-retrieval/05-rag-vs-long-context-vs-fine-tune/01-the-three-way-fork.read.md` claims "There are three ways to get knowledge into a language model at inference time. **Exactly three.**" And the rubric in `07-the-rubric.read.md` promises the right answer "falls out" mechanically from 5 axes.

In reality this is one of the most contested parts of the field. At least 5+ ways exist (RAG, long-context, fine-tune, prompt-stuffing-with-curated-snippets, tool-calling-into-live-systems, agentic-retrieval/multi-hop, knowledge-graphs-as-tools). The rubric ignores organizational, regulatory, and product-lifecycle constraints.

**Fix**: relabel as one practitioner's heuristic. Acknowledge the rubric's limits up front. Add "hybrid + roadmap to long-context as the corpus stabilizes" as a real fourth class.

### H-#11 — Greg Isenberg's tweets as load-bearing research source for ch26

Files: `26-agent-harnesses/02-architecting-an-ai-native-workflow/` (multiple), `26-agent-harnesses/03-five-industries-walked-through/` (every lesson)

The chapter on rebuilding businesses around agents cites Isenberg's X writing as canonical. Isenberg is an investor with takes, not a research source. The "case studies" (HVAC, insurance, recruiting) are extrapolated scenarios in the shape of Isenberg's tweet about what those industries "could" look like — not real deployments.

**Fix**: name the case studies as **illustrative**, not real. Find at least one real anchor (Klarna with caveats, Cresta, an actual home-services chain with public AI deployment writeups) and use it as the spine, with speculative scenarios as supplements.

### H-#14 — Reductive displaced-worker personas

The four canonical personas (Maya, Devon, Priya, Jules) — used in `04-where-this-course-goes/03-pick-your-path.mc.yaml` and elsewhere — lack:
- Childcare obligations
- Non-remote work schedules
- Visa status complications (H1-B 60-day rule)
- Financial-runway constraints
- Mental-health load (the course says "grief is real" once and moves on)

**Fix options:**
- Drop the personas entirely; let students bring their own life into the planning step
- Expand the personas with the messy real-life constraints displaced workers actually have

---

## Possible new chapter

### H-#16 — Honest about what the course cannot give

Halverson recommends adding a chapter (between ch00 and ch01) that names explicitly what the course **cannot** provide:
- Old salary back
- Guaranteed job
- The professional network they lost when they got cut

His argument: the honesty would earn trust the aphorisms don't.

---

## Things Halverson explicitly praised — do not change these

1. **`content/python/00-before-you-build/02-what-an-llm-actually-is/01-three-wrong-models.read.md`** — "clean three-pack of folk-models, takedowns correct without being smug"
2. **The goldfish-with-notebook framing** in ch00 lesson 02 — "the single best mental-model installation in the whole course"
3. **The postmortem template structure** in ch24 lesson 04 (real cases anchored to published rulings, taxonomized into classes)
4. **The "differently technical, not non-technical" reframe** in ch00 overview — "the best sentence in the entire curriculum"
5. **The model-picker decision rule** in ch13/03 (high-volume + non-critical → Haiku; high-volume + critical OR moderate volume → Sonnet; low-volume + high-stakes → Opus)

---

## Halverson's verdict (verbatim)

> "I would tell a displaced student to read ch00 lesson 02 (the mental-model installation) for free, then go take Harvard's CS50 or MIT's 6.0001 or a local community college Python class taught by an actual human, and come back for ch20-25 of this curriculum when they can already write Python — because those middle chapters on evals, retrieval, and debugging are the only part of the course that earns its claim to be teaching something the rest of the AI-education market is teaching badly. Ch00, ch26, and ch30 are not yet ready to be in front of the audience they claim to serve."
