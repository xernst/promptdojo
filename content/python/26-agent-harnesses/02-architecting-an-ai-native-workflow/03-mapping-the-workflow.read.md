---
xp: 1
estSeconds: 140
concept: workflow-spec-as-data
code: |
  # step 2 of the playbook: map the workflow like a machine.
  # encode answers to eight workflow-mapping questions as a python dict.
  support_triage_spec = {
      "name": "Support ticket triage",
      "trigger": "ticket created in Zendesk",
      "inputs": ["ticket.body", "customer.history", "plan.limits", "policy.refund"],
      "decisions": {
          "classify_type":    {"reversible": True,  "needs_approval": False},
          "draft_response":   {"reversible": True,  "needs_approval": False},
          "issue_refund":     {"reversible": False, "needs_approval": True},
          "escalate_to_eng":  {"reversible": False, "needs_approval": False},
      },
      "success_criteria": "first-response under 10min AND CSAT >= 4",
      "error_sites": ["wrong-account retrieval", "policy gap", "tone mismatch"],
      "tacit_knowledge": "when 'angry but right' looks different from 'angry and wrong'",
  }

  def required_fields():
      return ["name", "trigger", "inputs", "decisions", "success_criteria", "error_sites", "tacit_knowledge"]

  missing = [f for f in required_fields() if f not in support_triage_spec]
  print(f"missing fields: {missing}")
  print(f"decision count: {len(support_triage_spec['decisions'])}")
  print(f"high-risk decisions (need approval): "
        f"{[d for d, r in support_triage_spec['decisions'].items() if r['needs_approval']]}")
runnable: true
---

# Mapping the workflow like a machine

Step 2 of the playbook is the most important and the one teams skip
— the structural mapping that Isenberg's writing keeps pointing back
to:

> What triggers it? What data is needed? What decisions happen?
> Which decisions are reversible? Which require approval? What
> does success look like? Where do errors happen? What does a
> human know that the system does not?

Those eight questions are the workflow spec. Answer them in prose
and you have a Notion doc nobody reads. Answer them in code and you
have something an agent can ground its behavior in.

Run the editor. The `support_triage_spec` is a triage workflow
distilled into one dict. Every field a future agent would need to
do the job is here. The script prints the missing fields (none),
the count of decisions (four), and the ones that need approval
(refund, the only irreversible action).

That dict is the unit of work. Once it exists, the rest of
the playbook follows mechanically.

## The four decision categories

For every decision the workflow makes, two attributes determine
whether the agent gets to act or needs to ask:

|                 | Reversible | Irreversible |
|-----------------|-----------|--------------|
| Cheap to redo   | Auto-act  | Auto-act     |
| Expensive       | Auto-act  | **APPROVAL** |

The only quadrant where you ALWAYS gate on a human is
"irreversible + expensive." Refunding money. Sending an email to
the whole list. Deleting a customer record. Closing a deal.
Everything else can be drafted, recommended, classified, and shown
to a human for review — but executed by the agent.

## Why this works

Isenberg's general thesis: agents do the structured work, humans
handle taste, trust, judgment, relationships, and exceptions. The
spec is how you draw the line.
Anything you wrote down is structured work. Anything you couldn't
write down (the tacit_knowledge field) is the human's job.

If the `tacit_knowledge` field of your spec is empty, your workflow
is purely mechanical and the agent runs unsupervised. If it's a
paragraph long, the agent drafts and a human reviews. If it's a
page long, you're not ready to ship — start by writing the tacit
knowledge down.

## What this lesson builds

The next five steps walk through:
- Predicting how complete a spec is (step 4)
- Filling in missing required fields (step 5)
- Fixing a spec that references an "implicit" policy like "ask
  Sarah" (step 6)
- Fixing a spec whose metric is "hours saved" instead of business
  impact (step 7)
- Writing `is_ai_native_ready(spec)` end-to-end (step 8)
- Triaging three real workflow specs against the validator (step 9)

By the end, you'll be able to look at a workflow at your company
and grade it for AI-readiness in under a minute. The framework, in
code, in your browser.
