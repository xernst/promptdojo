---
xp: 1
estSeconds: 220
concept: the-eval-turn
---

# The eval turn: 2024 onward

If the prompt-engineering era had a single obituary, it was a blog
post Hamel Husain published in June 2024 titled **"Your AI Product
Needs Evals"** (hamel.dev/blog/posts/evals/). Hamel had spent the
prior eighteen months consulting for companies that had shipped LLM
features and were now drowning in production failures. The post was
not a thought piece. It was the field notes of someone who had
watched a dozen teams discover, independently, that the methodology
they'd been using had no answer to the question *"is the new prompt
better than the old one?"*

The thesis was simple and, by mid-2024, controversial:

> If you do not have an eval suite, you do not have an AI product.
> You have a demo that happens to be in production.

Hamel's framing landed because it named the thing every senior IC at
every AI company was already feeling. The vibes loop was not
sustainable. The next prompt change was always a coin flip. The
support tickets were already a stream, not a trickle. The eval turn
was the realization that the LLM industry had to grow up — fast — or
the products would not survive contact with the second year of
customer use.

## The supporting cast

Hamel's post wasn't alone. The same months produced a small library
of essays and papers that defined the new discipline:

**Eugene Yan** had been writing about evals from the ML engineering
side for almost a year — most famously the "Task-Specific LLM Evals
that Do & Don't Work" piece (eugeneyan.com/writing/evals/), which
catalogued what was actually working in production at scale. Yan's
contribution was the *taxonomy* — reference-free vs reference-based,
direct grading vs pairwise, code-graded vs model-graded — that gave
the discipline a shared vocabulary.

**Shreya Shankar** (Berkeley, now CMU) published the paper that gave
the field its academic spine: **"Who Validates the Validators?
Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences"**
(Shankar et al., UIST 2024, arxiv.org/abs/2404.12272). The paper
formalized the trust problem at the heart of LLM-as-judge — if you're
using a model to grade a model, who grades the grader? — and produced
EvalGen, the tool that lets you iteratively align an LLM judge to
human preferences. After this paper, "I'll just use LLM-as-judge"
stopped being a one-liner answer and started being a process.

**Braintrust** (braintrust.dev) was founded in late 2023 and shipped
its product around the same window as Hamel's post. It was the first
of the eval-native dev tools — not a generic logging platform, not a
LangChain plugin, but a tool whose entire reason to exist was running
eval suites against prompt changes. Within six months, every serious
AI infra company either had an eval product (LangSmith, Galileo,
Patronus) or was building one (OpenAI's evals SDK, the Inspect AI
framework from the UK AISI).

**Anthropic** put the period on the era in December 2024 with the
publication of **"Building Effective Agents"**
(anthropic.com/research/building-effective-agents). The essay is
worth rereading after you've finished this chapter. It is a how-to
guide for shipping agentic systems written by the company shipping
the most-deployed agentic system on the market, and the word "eval"
or "evaluation" appears in nearly every section. The mantra is
explicit:

> Successful implementations weren't using the most complex
> frameworks. They were using simple, composable patterns — and
> measuring the outputs at every step.

Translation: evals are not the last thing you do. Evals are the
*first* thing you do. The prompt comes after.

## What changed in the industry

By mid-2025, the cultural shift inside AI engineering was complete:

- **Job postings changed.** "Prompt Engineer" stopped appearing as a
  title. "AI / LLM Engineer" started carrying an explicit eval-suite
  requirement in the JD. By late 2025, "can you architect an eval
  harness for our use case" was a standard interview loop.
- **Tooling changed.** Every serious LLM framework now ships with
  evals as a first-class primitive (see lesson 02 step 1 for the
  table). The frameworks that didn't add evals got bypassed.
- **Internal practice changed.** Eval-mature teams started running
  their eval suite *on every prompt change*. Then *on every model
  version they tested*. Then *on every CI run*. Then *as a release
  gate*. The discipline tightened in stages.

Hamel's post named the field. Yan's posts gave it vocabulary.
Shankar's paper gave it academic rigor. Braintrust gave it tooling.
Anthropic's essay gave it the official seal. By the end of 2024, the
question stopped being "should I write evals?" and started being
"why don't you have them yet?"

The next step is interactive. You're going to play that question
forward — to a model-swap scenario — and see which kind of team
survives.
