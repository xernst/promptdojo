---
xp: 1
estSeconds: 160
concept: ai-assisted-vs-ai-native
code: |
  # the difference between "ai-assisted" and "ai-native" as a data shape.
  ai_assisted_company = {
      "question": "Where can we add AI to save time?",
      "ai_lives": "at the edges (chatgpt tab, marketing copilot)",
      "workflow_design": "human-driven, AI sprinkled on top",
      "human_role": "search engine, router, copywriter",
      "metric": "hours saved",
  }

  ai_native_company = {
      "question": "How should this workflow exist if agents do the first 80%?",
      "ai_lives": "at the center (agents in the operating fabric)",
      "workflow_design": "structured, documented, permissioned, instrumented",
      "human_role": "reviewer of ambiguity, supervisor of judgment",
      "metric": "resolution_time, conversion_rate, revenue_per_employee",
  }

  for k in ai_assisted_company:
      a = ai_assisted_company[k]
      n = ai_native_company[k]
      print(f"{k:18} assisted: {a}")
      print(f"{k:18} native:   {n}")
      print()
runnable: true
---

# AI-assisted is not AI-native. The difference is the question you ask.

Greg Isenberg has been writing on X about small AI-native services
businesses in a way that's landed harder than most "AI strategy"
content. The short version:

> An AI-native company is not a company that uses AI. It is a company
> that has been rebuilt so AI can actually operate inside it. The
> business is structured, documented, permissioned, and instrumented
> in a way that agents can understand.

That second sentence is the lesson. Run the editor. The two dicts
show the difference as DATA, not vibes. The AI-assisted company asks
"where can we add AI to save time?" The AI-native company asks "how
should this workflow exist if agents are doing the first 80%?"

That second question changes everything.

## The thesis: "AI cannot run on vibes"

Most "AI-native" companies are, per Isenberg, "someone on the team
has a ChatGPT tab open and the head of marketing made a custom GPT
called Brand Voice Assistant." Cute. Useful even. Not AI-native.

The real bottleneck is not the model. The model's raw outputs are
strong on most well-scoped tasks. The bottleneck is that most
companies are **illegible to machines** — the CRM says one thing,
the Slack thread says another, the real customer history lives in
someone's inbox, the pricing logic is in a spreadsheet called
`Final_v7_NEW.xlsx`, the refund policy is in a Notion doc nobody
trusts, the sales process is "talk to Sarah, she knows how we do
enterprise."

An agent walking into that company doesn't fail because of the
model's outputs themselves — it fails because the surrounding
scaffolding (tools, retrieval, validation, policy) has nothing to
ground in: no source of truth, no rule to follow, no boundary to
respect. Garbage-in, vibes-out. (We'll keep saying things like
"the model decides" or "the agent figures it out" as shorthand.
Recall from ch00 that this is convenience phrasing — the model is
sampling the next token from a probability distribution, not
deciding.)

## What this lesson is about

You wrote a harness in lesson 1. The harness is the technical
layer. This lesson is the ORGANIZATIONAL layer: the work you do
BEFORE the harness runs to make the workflow machine-readable.

We'll encode a 5-step playbook (synthesizing Isenberg's writing on AI-native services businesses) as code:

1. **Pick a narrow workflow** with high volume, existing rules, and
   too much human coordination.
2. **Map the workflow like a machine.** Triggers, data, decisions,
   reversibility, approvals, success criteria, error sites, tacit
   knowledge.
3. **Structure the knowledge.** Write the policy. Make pricing
   rules explicit. Define tone. Create examples. "It feels like
   documentation. It is not documentation. It is infrastructure."
4. **Put agents in with boundaries.** Let them draft, classify,
   recommend, enrich, summarize, prepare. Actions only where risk
   is understood. Approval where judgment matters.
5. **Measure business impact.** Not "hours saved." Resolution time.
   Conversion rate. Gross margin. Revenue per employee.

By the end, you'll have `is_ai_native_ready(spec)` that takes a
workflow definition and returns the same structural critique
Isenberg's writing applies in prose. The framework, in code.
