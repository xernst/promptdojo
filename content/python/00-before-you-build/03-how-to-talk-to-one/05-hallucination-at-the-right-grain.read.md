---
xp: 1
estSeconds: 240
concept: hallucination-as-fluent-fiction
---

# "Hallucination" is misleading shorthand

The industry settled on the word "hallucination" early, and we're
stuck with it now, but it's wrong in a way that matters. The model
isn't dreaming. It isn't tripping. It isn't confused. It is doing
the one thing it has ever done: producing fluent text, one token at
a time, weighted by what's likely.

Sometimes that text is true. Sometimes that text is plausible-shaped
fiction. From the inside of the model, those two cases look
identical. There is no internal "I'm not sure" lamp. There is no
hesitation mark. There is one mechanism — sample from the
distribution — and it runs at the same temperature on a true answer
as on a made-up case citation.

> The model is always guessing the next token; sometimes the guess
> is true, sometimes it's plausible-shaped fiction. Confidence is a
> style, not a signal.

That second sentence is the one to hold onto. **Confidence is a
style, not a signal.** When the model writes "The Air Canada
chatbot policy was upheld in *Moffatt v. Air Canada*, 2024" with
the same tone it writes "Paris is the capital of France," it is not
telling you which one it's sure about. It is, in both cases, just
writing the most likely next token. One of those facts happens to
be real. (The lawsuit was real and Air Canada lost. The citation
formatting is illustrative.) The model wrote both sentences with
the same confidence because the model has only one confidence
setting: whatever the temperature is set to.

## Why this matters more for builders than for users

When you're using ChatGPT yourself as a user, a hallucination is
annoying but recoverable. You read the answer, you notice something
feels off, you check it, you move on.

When you're **building** with the model — say, you've put it on a
website to answer customer questions, or you've wired it into an
internal tool that lawyers depend on, or you've made it the front
end of a government program — a hallucination is not annoying. It
is a lawsuit, a regulatory violation, a customer-facing scandal, or
all three.

This course will spend an entire lesson (ch24, lesson 04) walking
through real incidents. As a preview:

- **Air Canada** had a customer-service chatbot in operation by 2022 that
  invented a bereavement-refund policy that didn't exist. A
  bereaved customer relied on it, was denied the refund, and sued.
  Canada's civil-resolution tribunal ruled in 2024 that Air Canada
  was responsible for what its chatbot said. The airline paid out
  and the policy made the front page of every "AI risk" piece in
  2024-25.
- **NYC's MyCity chatbot**, launched 2024, told small-business
  owners they could fire workers for reporting sexual harassment,
  steal employees' tips, and serve food rats had nibbled on. All
  illegal. The chatbot was confident. The errors made the *New York
  Times*. The Mayor's office defended it for weeks before quietly
  scoping it back.
- **DPD's customer-service chatbot** in early 2024 was prompt-injected
  into swearing at a customer, writing a poem about how terrible
  DPD was, and recommending alternative couriers. The customer
  posted screenshots. The chatbot was pulled the same day.

Three different companies. Three different industries. Three
different prompts. One shared mechanism: the model produced fluent
text, the team shipped it without verification, the fluent text
turned out to be either fiction or hijacked.

You are going to spend the rest of this course building the muscle
to **not be that team**. The muscle is: a fluent answer is not a
verified answer. The model's confidence is a style. The model's
correctness is something you have to engineer for, separately,
using ground-truth retrieval (ch15), evals (ch24), and human review
at the right points (ch22).

## The right mental model

Hold these three sentences:

1. The model produces a probability distribution over next tokens.
2. The output you see is a sample from that distribution, the
   shape of which is set by the temperature.
3. The model does not know which samples are true. You do.

Lesson 02 gave you the first two. This reading is the third. Once
you can hold all three at once, "hallucination" stops being a
mysterious failure mode and starts being a predictable consequence
of the same mechanism that produces every other output the model
makes.

The model is always doing the same thing. Your job — and the job of
every chapter after this one — is to engineer the system around the
model so the parts that have to be true actually are.
