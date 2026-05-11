// Heuristic prompt-critique engine. Pure functions, zero deps, runs in
// the browser. Every rule returns { hit, evidence } so the UI can quote
// the exact phrase that earned the roast — vibe-free, code-grounded.
//
// Calibration: rules fire on patterns Cursor / Claude Code routinely
// misinterpret. Not a grammar checker, not a politeness police — a
// directness-and-specificity audit shaped by the curriculum's chapter 19.

export type RoastSeverity = "low" | "med" | "high";

export type RoastHit = {
  id: string;
  title: string;
  severity: RoastSeverity;
  evidence: string;
  fix: string;
};

export type RoastReport = {
  score: number;
  verdict: string;
  hits: RoastHit[];
  wins: string[];
  wordCount: number;
};

type Rule = {
  id: string;
  title: string;
  severity: RoastSeverity;
  fix: string;
  check: (raw: string, lower: string, words: string[]) => string | null;
};

// Shared audience-detection regex. Used by the `no-audience` penalty rule
// AND the `names the audience` win check, so they can't disagree. Without
// the shared constant, a prompt could earn the win and the penalty at
// the same time (review P2-1).
const AUDIENCE_RE =
  /\b(for (a |an )?(beginner|expert|executive|cto|cfo|ceo|pm|engineer|developer|child|kid|5-year-old|five-year-old|10th grader|investor|customer|team|founder|recruiter|reader|adult|technical|non-technical))\b/;

const RULES: Rule[] = [
  {
    id: "too-short",
    title: "too short to know what you mean",
    severity: "high",
    fix: "name the task, the input, the desired output shape, and the audience. minimum four nouns.",
    check: (_raw, _lower, words) =>
      words.length < 10 ? `${words.length} words` : null,
  },
  {
    id: "vague-opener",
    title: "vague opener — 'help me' isn't a task",
    severity: "high",
    fix: "open with an imperative verb: rewrite, summarize, classify, translate, extract.",
    check: (_raw, lower) => {
      const m = lower.match(
        /^(help me|can you|could you|i need|i want|i would like|please help|do you think|i'm trying)\b/,
      );
      return m ? m[0] : null;
    },
  },
  {
    id: "no-examples",
    title: "no examples — the model is guessing what 'good' looks like",
    severity: "high",
    fix: "show one input → output pair. 'like this: \\\"foo\\\" → \\\"FOO\\\"'.",
    check: (_raw, lower) => {
      const hasExample =
        /\b(for example|e\.g\.|such as|like this|here's an example|example:)/.test(
          lower,
        ) || /->|=>|→/.test(lower);
      return hasExample ? null : "no input/output pair anywhere";
    },
  },
  {
    id: "yes-no-masquerade",
    title: "open-ended question dressed as yes/no",
    severity: "med",
    fix: "ask for the thing, not permission to ask. 'rewrite the headline', not 'can you help with the headline'.",
    check: (_raw, lower) => {
      const m = lower.match(/^(can you|could you|would you|will you|do you think)\b/);
      return m ? m[0] : null;
    },
  },
  {
    id: "politeness-padding",
    title: "politeness padding the model has to parse around",
    severity: "low",
    fix: "drop 'please', 'kindly', 'if you don't mind'. the model isn't offended by directness.",
    check: (_raw, lower) => {
      const hits = lower.match(/\b(please|kindly|if you don't mind|thank you|thanks in advance)\b/g);
      return hits ? hits.join(", ") : null;
    },
  },
  {
    id: "hedging",
    title: "hedging — you don't actually know what you want",
    severity: "med",
    fix: "decide. 'maybe a list' becomes 'a bulleted list of 5 items'.",
    check: (_raw, lower) => {
      const hits = lower.match(
        /\b(maybe|perhaps|kind of|sort of|i guess|i think|something like|possibly)\b/g,
      );
      return hits ? hits.join(", ") : null;
    },
  },
  {
    id: "vague-nouns",
    title: "vague nouns — 'something', 'thing', 'stuff'",
    severity: "med",
    fix: "name the noun. 'a tweet', 'a slack message', 'a python function', 'a sql query'.",
    check: (_raw, lower) => {
      const hits = lower.match(/\b(something|some thing|stuff|things|thing)\b/g);
      return hits ? hits.join(", ") : null;
    },
  },
  {
    id: "no-format",
    title: "no output format — model picks one for you, often wrong",
    severity: "high",
    fix: "specify shape: 'as a json array of objects with name and score', 'in markdown table', 'one line each'.",
    check: (_raw, lower) => {
      const has =
        /\b(json|yaml|markdown|table|bullets|bullet list|numbered list|csv|xml|html|one line|sentence|paragraph|tweet|slack|email)\b/.test(
          lower,
        );
      return has ? null : "no format specified";
    },
  },
  {
    id: "no-audience",
    title: "no audience — model defaults to 'general adult internet'",
    severity: "med",
    fix: "name the reader. 'for a 5-year-old', 'for an executive', 'for a senior backend engineer'.",
    check: (_raw, lower) => {
      return AUDIENCE_RE.test(lower) ? null : "no target reader named";
    },
  },
  {
    id: "no-constraint",
    title: "no length cap — model writes until it gets bored",
    severity: "med",
    fix: "cap it. 'under 100 words', 'exactly 3 bullets', 'one tweet (280 chars)'.",
    check: (_raw, lower) => {
      const has = /\b(\d+\s*(words?|chars?|characters?|sentences?|bullets?|paragraphs?|lines?|items?)|under \d+|at most \d+|max(imum)? \d+|less than \d+)\b/.test(
        lower,
      );
      return has ? null : "no length / count constraint";
    },
  },
  {
    id: "multi-task-soup",
    title: "multi-task soup — the model will half-do all of them",
    severity: "high",
    fix: "one task per prompt. if you need three things, send three prompts (or one prompt with explicit steps 1, 2, 3).",
    check: (raw, lower) => {
      const sentences = raw
        .split(/[.!?\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const imperatives = sentences.filter((s) =>
        /^(write|rewrite|translate|summarize|extract|classify|sort|filter|generate|create|make|build|design|draft|explain|analyze|find|list|convert|format|tell|give|describe|compare)\b/i.test(
          s,
        ),
      );
      if (imperatives.length >= 2 && !/\b(then|first|next|finally|step \d|1\.|2\.)\b/.test(lower)) {
        return `${imperatives.length} commands in one prompt, no ordering`;
      }
      return null;
    },
  },
  {
    id: "all-caps",
    title: "shouting — caps don't make the model try harder",
    severity: "low",
    fix: "lowercase it. urgency comes from constraints, not capslock.",
    check: (raw) => {
      const letters = raw.replace(/[^a-zA-Z]/g, "");
      if (letters.length < 20) return null;
      const upper = letters.replace(/[^A-Z]/g, "").length;
      const ratio = upper / letters.length;
      return ratio > 0.35 ? `${Math.round(ratio * 100)}% of letters are uppercase` : null;
    },
  },
  {
    id: "leaks-answer",
    title: "you wrote the answer in the prompt",
    severity: "med",
    fix: "if you know the answer, you don't need the model. ask for what you don't know.",
    check: (raw, lower) => {
      const m =
        lower.match(/the answer is\s+[^.\n]+/) ||
        lower.match(/i already know it should be\s+[^.\n]+/) ||
        lower.match(/it should say\s+[^.\n]{10,}/);
      return m ? m[0].slice(0, 80) : null;
    },
  },
  {
    id: "role-bloat",
    title: "'you are an expert X' costs tokens, buys little",
    severity: "low",
    fix: "skip the role-play preamble. specify the output. the model performs to the spec, not the costume.",
    check: (_raw, lower) => {
      // Anchor to start-of-prompt or sentence to avoid firing on prose
      // like "the customer is an expert in their domain".
      const m = lower.match(
        /(^|[.!?\n]\s*)(you are|act as|pretend you are|imagine you are) (an? )?(expert|world-class|seasoned|professional|10x|senior|amazing|brilliant)\s+\w+/,
      );
      return m ? m[0].trim() : null;
    },
  },
  {
    id: "wishful-think",
    title: "wishful thinking — 'be creative' / 'think outside the box'",
    severity: "low",
    fix: "creativity is a constraint, not a vibe. 'pick the third-most-obvious angle', 'avoid analogies to sports'.",
    check: (_raw, lower) => {
      // Phrase-level matches only. Bare adjectives like 'original' or
      // 'innovative' generate too many false positives in legitimate
      // prompts ("give me 5 original ideas for...").
      const hits = lower.match(
        /\b(be creative|be original|be unique|be innovative|be imaginative|think outside the box|surprise me|push the envelope|out of the box)\b/g,
      );
      return hits ? hits.join(", ") : null;
    },
  },
];

const POSSIBLE_WINS = [
  {
    label: "names the output format",
    check: (lower: string) =>
      /\b(json|yaml|markdown|table|bullets|csv|xml|html|one line|paragraph|tweet|tsv)\b/.test(lower),
  },
  {
    label: "shows an example",
    check: (lower: string) =>
      /\b(for example|e\.g\.|such as|like this|example:)/.test(lower) ||
      /->|=>|→/.test(lower),
  },
  {
    label: "names the audience",
    check: (lower: string) => AUDIENCE_RE.test(lower),
  },
  {
    label: "caps the length",
    check: (lower: string) =>
      /\b(\d+\s*(words?|chars?|sentences?|bullets?|lines?|items?)|under \d+|at most \d+|max \d+)\b/.test(
        lower,
      ),
  },
  {
    label: "opens with a clear imperative",
    check: (_lower: string) => {
      const m = _lower.match(
        /^(rewrite|summarize|extract|classify|translate|generate|list|convert|sort|filter|compare|analyze|critique|draft|outline)\b/,
      );
      return Boolean(m);
    },
  },
];

const SEVERITY_WEIGHT: Record<RoastSeverity, number> = { low: 4, med: 9, high: 16 };

export function roastPrompt(input: string): RoastReport {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const words = raw.split(/\s+/).filter(Boolean);

  const hits: RoastHit[] = [];
  for (const rule of RULES) {
    const evidence = rule.check(raw, lower, words);
    if (evidence) {
      hits.push({
        id: rule.id,
        title: rule.title,
        severity: rule.severity,
        evidence,
        fix: rule.fix,
      });
    }
  }

  const wins = POSSIBLE_WINS.filter((w) => w.check(lower)).map((w) => w.label);

  const penalty = hits.reduce((acc, h) => acc + SEVERITY_WEIGHT[h.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  let verdict: string;
  if (score >= 85) verdict = "ship it. the model has what it needs.";
  else if (score >= 65) verdict = "decent. tighten one or two screws and ship.";
  else if (score >= 40) verdict = "you're doing the model's job for it. rewrite.";
  else if (score >= 20) verdict = "vibe-prompt. expect a vibe-answer.";
  else verdict = "you typed 'help me' into a generative model. of course it lied.";

  return { score, verdict, hits, wins, wordCount: words.length };
}

export const ROAST_EXAMPLES: { label: string; prompt: string }[] = [
  {
    label: "the cursor-shaped DM",
    prompt:
      "hey can you maybe help me write something for my pricing page? something like a hero headline that's kind of clever and converts well. thanks!",
  },
  {
    label: "the multitasker",
    prompt:
      "Summarize this article, then translate it to spanish, then write a tweet about it, and also extract the names of all people mentioned.",
  },
  {
    label: "the shouter",
    prompt:
      "WRITE ME A LANDING PAGE COPY THAT CONVERTS LIKE CRAZY. BE CREATIVE!!! YOU ARE A WORLD-CLASS COPYWRITER!",
  },
  {
    label: "the tight one",
    prompt:
      "Rewrite this paragraph for a non-technical executive in 2 sentences, max 40 words, as plain prose (no bullets). Input: 'The system uses an event-driven micro-service architecture with kafka topics for inter-service communication, deployed on EKS with autoscaling tied to HPA metrics.' Output the rewrite only — no preamble.",
  },
];
