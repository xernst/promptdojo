## The skill nobody admits is half their job now

You spend hours per week typing into Cursor and Claude Code. The prompts you write determine whether the next session is fifteen minutes of one-shot shipping or four hours of "no, that's wrong, try again, no, not like that." It's the most consequential typing you do, and most people are terrible at it because nobody teaches it.

This chapter is the structure that fixes the most one-shot prompts. Not a "prompt engineering framework" — there are dozens of those and they don't help. The actual scaffold professional builders use, and the specific mistakes AI makes when you get the prompt wrong.

## Why this isn't "just write better prompts"

Generic prompting advice ("be specific!" "give examples!") doesn't survive contact with a real Cursor session. The reason is that prompting an agent is fundamentally different from prompting a single-turn chatbot. The agent has tool access, file context, a previous turn, multi-second latency between calls. Prompts that work in a Claude.ai chat window often fail in Cursor because the context surface is different.

So this chapter is calibrated specifically to AI-builder tools — Cursor, Claude Code, the agent runtimes you actually use — not to chatbots.

## The six-knob scaffold (ch00's five plus one)

Chapter 0 introduced a five-knob prompt scaffold — **Role, Task, Context, Format, Examples**. That scaffold is the shape that works across domains. This chapter drills on each knob in the specific context of prompting a coding agent, and adds a sixth knob that real codebases need:

1. **Role** — *who is the model in this task.* "Senior backend engineer working in this fastapi codebase" produces different output than the default "helpful assistant." Set it explicitly.

2. **Task** — *the single concrete thing you want.* One sentence. One outcome. If you're saying "and also" or "while we're at it," send those as separate prompts.

3. **Context** — *what file am I in, what stack, what does the model need to know.* The knob most people skip. Without it, the model is guessing what kind of project you're in, and a guess wrong-foots the rest of the session.

4. **Format** — *how you want the answer back.* "Diff only." "Code only." "List of file paths." "Two sentences max." Free token savings on every turn.

5. **Examples** — *what good output looks like in this codebase.* Usually a pointer to existing code: "match the style of `get_user()`." One pointer to working code beats three paragraphs of style guidance.

6. **Constraints** — *what you must use, what you must not do, what edge cases matter.* This is the production-only knob. Every constraint stated up front is a wrong path the model never goes down. "Don't add new dependencies." "No try/except for happy-path errors."

Once you've internalized the six knobs you'll spot which one is missing in any prompt you read.

## Why context rot is real and how to handle it

After about an hour of back-and-forth with Cursor, the conversation accumulates corrections, dead ends, and stale assumptions. The model is now anchored on theories you've since invalidated. Anything you say is fighting that history.

The fix is not to argue with the model. The fix is to start over. `/clear` in Claude Code starts a fresh conversation; `/compact` summarizes and continues. Both lose nothing because the *files* are the progress, not the chat. Beginners are reluctant to clear because it feels like "throwing away progress." Professional builders clear several times a day because they know the chat is a means.

Three signals that you should `/clear` right now:

- The model keeps suggesting the same wrong thing after you've corrected it twice.
- It's hallucinating function signatures from libraries it should know — usually means it's averaging across versions in its training data.
- You've said "no, that's wrong" twice in a row. The session has a wrong working theory baked in.

## What AI specifically gets wrong about prompting

Three patterns Cursor users reliably ship:

1. **Wall-of-text prompts with no structure.** Goal, context, and format mashed together. The model has to guess what's a constraint versus an aspiration. Step 5 of this chapter is rewriting one of these.

2. **Vague success criteria.** "Make this faster" without saying how to measure. "Improve the error handling" without saying what counts as improved. The model picks an interpretation, you don't like it, you waste the turn.

3. **Missing the format constraint.** AI defaults to *explaining* what it did, which is helpful when learning and noise when shipping. Tell it: "diff only" or "code only." This single sentence saves more tokens per session than any other.

## What you'll be able to do at the end

Nine steps. By the end you'll be able to:

- Look at a vague prompt and rewrite it on the spot using the six-knob scaffold.
- Recognize the three signals that a session has hit context rot and clear it without hesitation.
- Use `/clear` versus `/compact` correctly in Claude Code.
- Spot the three top "AI wrote this prompt poorly" patterns in your own work.

Chapter 19 is the highest-ROI single chapter in the wedge for builders who already use Cursor daily. The other chapters teach you to read what AI does. This one teaches you to direct it.

Press *Start chapter* below.
