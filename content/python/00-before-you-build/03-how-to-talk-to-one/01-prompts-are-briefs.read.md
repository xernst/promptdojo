---
xp: 1
estSeconds: 240
concept: prompts-as-briefs
---

# A prompt is a brief

If you've ever written a creative brief, a customer-service call
script, a contract clause, an SOP, or a casting note — you've already
written prompts. You just didn't know they were called that, and you
didn't know the audience would turn out to be a probability
distribution over tokens.

> You already know how to write a brief. That's 80% of prompting.

This lesson exists because most "intro to prompting" content treats
the skill as new. It isn't new. The deliverable changed; the
craft didn't. The craft is the same one that produced every
good ad campaign, every clear SOP, every cleanly-drafted contract,
every well-run support team. You name a role. You name a task. You
give the context. You specify the shape of the output. You provide
examples. Then you ship the brief and the work comes back.

What changed is who's reading the brief and how literally they
interpret it. The model reads it like a junior contractor on their
first day: literal, fast, eager, with no shared history and no
ability to ask clarifying questions. That's it. That's the whole
adjustment.

## Side by side: a 1995 creative brief and a 2026 LLM prompt

Here is a real-shape creative brief from a 1995 agency. Read it.

> **Client:** Midwest Furniture Co-op
> **Project:** Spring catalog cover
> **Audience:** 35-55, suburban, household income $60-120k, owns home
> **Mood:** Warm, traditional, "weekend morning"
> **Constraints:** Must show three pieces from the new oak line. No
> children in shot. No fluorescent light. Logo bottom-right.
> **Reference:** Pottery Barn 1994 fall catalog, pages 12-15
> **Deliverable:** One 8x10 transparency, suitable for offset print
> **Deadline:** Tuesday

Now here is a 2026 LLM prompt for the equivalent digital task. Read
it next to the brief above.

> You are a senior catalog art director. Generate a description of a
> spring catalog cover photograph for a Midwest furniture co-op.
> Audience: 35-55 suburban homeowners, household income $60-120k.
> Mood: warm, traditional, "weekend morning." Must feature three
> pieces from the new oak line. No children in shot. No fluorescent
> light. Logo bottom-right. Reference: Pottery Barn 1994 fall
> catalog, pages 12-15. Output: a single paragraph, 80-100 words,
> suitable for handoff to a photographer.

They are the same brief. The 2026 version has the role written
explicitly ("you are a senior catalog art director") and the output
shape stated in tokens ("a single paragraph, 80-100 words"), but
every other field maps one-to-one. Audience, mood, constraints,
references, deliverable. Same.

If you wrote the first one in 1995, you can write the second one in
2026. The skill is intact. The skill is portable.

## Two modes of prompting: user vs. builder

There is a distinction in this course you need to get straight early,
because it will come back in every later chapter:

- **Prompts as artifacts** (user mode). You sit at the ChatGPT or
  Claude window, you type a request, the model responds, you read
  the response, you adjust the request, you go again. The prompt is
  a thing you write once and throw away. This is what most people
  mean when they say "prompting."

- **Prompts as system components** (builder mode). The prompt lives
  inside a program. The program runs it a thousand times a day,
  against a thousand different inputs, and ships the output to a
  customer who never sees the prompt. The prompt is a piece of
  infrastructure. It has tests, version control, and a change log.
  This is what the rest of this course is about.

The 5 knobs you'll learn next apply to both modes. The practice is
identical. What changes is the cost of getting the prompt wrong.
A bad user-mode prompt wastes thirty seconds of your time. A bad
builder-mode prompt that ships into production wastes an Air Canada
refund lawsuit, a NYC government scandal, a swearing-bot PR cycle.
(We'll cover all three in ch24. They each started with a prompt
nobody treated as infrastructure.)

For ch00, you're going to learn the discipline in user mode, because
that's the mode you can practice today without writing any code. By
ch19, you'll be writing builder-mode prompts. By ch24, you'll be
testing them. By ch26, you'll be deploying them into agent
harnesses that run them at scale.

But it all starts here: a prompt is a brief. You already know how to
write a brief. Let's name the parts.
