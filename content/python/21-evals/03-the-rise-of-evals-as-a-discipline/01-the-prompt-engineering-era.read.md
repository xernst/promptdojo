---
xp: 1
estSeconds: 220
concept: prompt-engineering-era
---

# The vibes era: 2022 to 2024

For about eighteen months after ChatGPT shipped, the entire LLM
industry ran on a methodology that, in retrospect, was a methodology
only by accident. It had a name — **prompt engineering** — and a job
title to match. LinkedIn filled with "Prompt Engineer" titles
attached to six-figure salaries. Twitter filled with thread after
thread of "the 17 magic phrases that 10x ChatGPT." A cottage industry
of "prompt marketplaces" appeared, selling jailbreaks and templates
for $9.99.

The underlying loop looked like this:

1. Write a prompt.
2. Run it on three or four inputs you happen to remember.
3. If the output looks good, ship it.
4. When a customer complains, go back to step 1.

That's it. That was the methodology. Nobody called it "vibes" at the
time — at the time it just felt like the work. But it was vibes. The
quality bar was "does this feel right when I read it." The
regression detection was "did anyone complain yet." The release
gate was "the founder said go."

## Why the vibes era worked at first

It worked for the same reason any unscalable practice works at small
scale: the surface area was small. The first wave of LLM products
were demos and prototypes. A demo only has to work for the demo. A
prototype only has to work for the screenshot you put in the deck.
If your prompt fails on input #47, you'll never know, because input
#47 was never going to happen in front of an investor.

It also worked because the models themselves were a moving target in
a way that hid product quality issues. Every six months a new model
dropped that was strictly better than the last. If your prompt had a
bug, you could often just wait three months and let the next model
patch over it. That's not engineering. That's hoping. But it felt
like progress, and the chart of model capability over time made
everyone feel like geniuses.

## Why the vibes era failed for products

The moment you go from demo to product, three things break:

**Vibes don't survive a model swap.** Every prompt engineer of the
2023 era has the same scar: the day OpenAI deprecated `gpt-3.5-turbo-0301`
and their carefully tuned prompt started returning garbage. Vibes are
local to a model version. The minute the model changes — and models
change every quarter — your "battle-tested" prompt is no longer
battle-tested against anything. Without an eval suite, you don't know
*how* it broke. You only know that the support tickets are flowing.

**Vibes don't catch regressions.** The most expensive bug in LLM
products is the silent one: your prompt got "improved" last Tuesday to
fix a customer complaint, and now it's worse on a different input
nobody noticed. There is no way to detect this without a regression
suite. None. The vibes era had no answer for this problem — the
answer was "hope the next complaint surfaces it quickly."

**Vibes can't be reviewed.** A PR that says "I changed the prompt
from X to Y, it feels better to me" is not reviewable. The reviewer
has no basis to push back. They either trust you or they don't. This
killed the engineering culture inside AI teams. Senior ICs could not
do their job — could not catch bad changes, could not enforce a
quality bar — because there was nothing to point at. Process collapsed
into "whoever yells the loudest wins the prompt fight."

## The cultural tell

The clearest sign that prompt engineering was about to collapse as a
discipline was the way prompt engineers talked about their work. They
described it the way magicians describe magic — as art, as feel, as
something that couldn't quite be explained. "You have to *know* what
the model wants." "Some prompts just *have it*." "I can tell within a
sentence whether a prompt will work."

This is the language of a field that hasn't been measured yet. Every
discipline goes through this phase before it becomes engineering. The
chefs before recipes. The pilots before instruments. The doctors
before germ theory. The phase ends when somebody figures out how to
measure the thing — at which point all the people who described it
as art either retool or get washed out.

For LLMs, that moment came in 2024. It has a name. We'll cover it in
the next step.
