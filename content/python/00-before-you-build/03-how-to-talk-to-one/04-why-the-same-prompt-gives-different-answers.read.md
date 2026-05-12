---
xp: 1
estSeconds: 220
concept: temperature-and-sampling
---

# Why the same prompt gives different answers

You wrote a clean 5-knob prompt. You sent it twice. You got two
different answers back. The model is broken, right?

It isn't. It's working exactly the way lesson 02 said it works.

Recall the one-sentence definition from the previous lesson: an LLM
is a function that takes a sequence of tokens and returns a
**probability distribution** over every possible next token. What
comes back to you on the screen is not the distribution. It's a
**sample** drawn from it. Run the prompt again, draw a different
sample, get a different answer.

That's the mechanism. There is no magic and there is no bug. Now
let's talk about the dial that controls how the sample gets drawn.

## Temperature is the dial

Every modern LLM exposes a parameter called **temperature**, usually
a number between 0 and 1 on Anthropic, 0 and 2 on OpenAI. Temperature
controls how sharp or flat the sampling is. (Heads up: some newer
Anthropic models like Opus 4.7 sample adaptively and reject the
temperature field entirely.)

> The thermostat metaphor — temperature 0 = repetitive, mid = varied,
> near max = chaos.

Walk it through:

- **Temperature 0.** The sampler is greedy. Whatever token has the
  highest probability in the distribution, that's the one that gets
  picked. Every time. Same prompt, same output, no variance. Useful
  when you want deterministic behavior — say, a classifier that
  always returns the same label for the same input.

- **Temperature 1.** The sampler is honest to the distribution. If
  "Paris" has 97% of the probability mass, you'll get "Paris" 97% of
  the time. If five different colors each have ~15%, you'll see all
  five over enough runs. The model behaves the way the underlying
  probabilities say it should.

- **Temperature near max — 1 on Anthropic, 2 on OpenAI.** The sampler
  flattens the distribution before drawing. Low-probability tokens get
  picked more often. Output gets weirder, more surprising, sometimes
  more creative, occasionally word salad. Useful for brainstorm-style
  work, bad for anything that has to be correct.

Most chat products — ChatGPT, Claude, Gemini — ship with a default
temperature around 0.7 to 1.0. That's why the same question gives
you variety. The default is tuned for "feels like a conversation,"
not for "produces the same answer every time."

## What this means for you, today

If you've ever asked a chatbot the same question twice and gotten
two different answers, you didn't catch the model lying. You caught
it sampling. The information is the same. The token it landed on
this time is different.

A few practical implications, because we'll come back to all of
them in later chapters:

- **In production, lower the temperature.** When you're building
  something — say, an email classifier — you want the same input to
  produce the same output. Crank temperature down toward 0. The
  output gets more boring, which is what you want.
- **In chat, leave it where it is.** When you're using ChatGPT
  yourself as a user, the default temperature is fine. Variety is
  what makes the conversation feel like a conversation.
- **Don't try to coach away the variance with prompt wording.** You
  can't write "be consistent" hard enough to undo a high temperature.
  Temperature is upstream of the prompt. If you need consistent
  output, change the temperature, don't argue with it.
- **Temperature is a knob, not a personality.** "The model is being
  creative today" is just temperature > 0. Choose it deliberately
  per task. Classification: low. Brainstorm: high. Drafting: middle.

You don't need to set temperature in this course until ch08, when
you start writing your own API calls. But you need to know the dial
exists, because it explains 80% of "why did it answer differently
this time?" without you having to invoke any spookier theories.

The next reading is about the other 20% — the answers that are
different and also wrong.
