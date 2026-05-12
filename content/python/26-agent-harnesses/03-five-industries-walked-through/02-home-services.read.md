---
xp: 1
estSeconds: 200
concept: case-study-home-services
---

# Case 1: Home services (HVAC, plumbing, electrical, cleaning)

A 30-person HVAC company in suburban Phoenix. $4M ARR. Two dozen
techs in the field, four dispatchers, two estimators, two AR
clerks, a service manager, a marketing person, the owner. Phones
ring all day. Most calls are 90 seconds of small talk followed by
"can you come fix my AC tomorrow." The owner has been doing this
for 22 years and his head is the operating system.

This is the kind of company Isenberg's writing points at: boring,
profitable, fragmented industries. Margins are 12-18%. The owner
wants to retire. Nobody at the company has touched a Python
interpreter in their lives.

## The old workflow

Customer calls. Dispatcher writes the request on a paper form
(yes, still). Walks it to the estimator. Estimator looks at the
customer's address in QuickBooks to see if they're a prior
customer. If they are, calls the tech who handled them last time to
ask "what was this house like?" Tech doesn't answer because he's on
a roof. Estimator quotes from memory plus a 10% pad. Schedule gets
made by hand on a whiteboard. Tech shows up. Tech doesn't have the
right part because nobody told inventory. Tech drives 20 minutes to
the supply house. Tech finishes the job. Tech texts the dispatcher
"done." Dispatcher updates QuickBooks. Three days later, the AR
clerk emails an invoice. Two weeks later, the AR clerk emails a
reminder. Six weeks later, the AR clerk calls. The owner takes
40% of his calendar to handle "exceptions" — i.e., everything the
system didn't know how to do.

Every step in that flow is a coordination tax. The technical work
takes two hours. The administrative work takes six.

## The AI-native version

Customer calls. The phone is answered by a voice agent that
classifies the request (emergency vs scheduled, residential vs
commercial, service vs install), pulls the customer's history from
the unified record, checks tech availability against geographic
clustering, and offers three time slots. The customer picks one.

Behind the scenes, an agent has already:

- Looked up the equipment at the address (from the prior service
  record) and pre-allocated the parts likely to be needed.
- Generated a job brief for the tech: customer name, address, prior
  history, equipment model, common failure modes for that model,
  parts queued at the supply house.
- Drafted a quote based on the equipment + job type + the explicit
  pricing rules in the spec. Quote requires owner approval if it's
  over $2,000 (the auto_approve threshold from step 06 of the
  previous lesson).
- Sent the customer a confirmation with a calendar invite, an
  appointment-window text, and a "here's what to expect" PDF.

Tech arrives. Tech's phone shows the job brief. Tech does the
work. Tech speaks one paragraph into the app: "Replaced the
capacitor, recharged refrigerant, customer asked about a maintenance
plan." The agent turns that into:

- An updated service record.
- An automatic invoice draft (sent for owner approval if over
  threshold).
- A flagged sales opportunity for the maintenance plan, queued for
  the marketing person's morning review.
- A scheduled follow-up text 7 days later asking the customer for a
  review.

AR clerk doesn't exist anymore. Or rather, she exists in a different
role — she handles the 5% of invoices that can't auto-resolve
(disputes, payment plan requests, payer changes), supervising the
agent that handles the other 95%.

The owner stops being the operating system. The dispatch whiteboard
is gone. The "ask Sarah" parts of the business are written down as
rules. The company runs.

## Where the wedge is

The single highest-leverage automation is **classify-and-quote**.
Once an incoming request can be classified (emergency vs scheduled,
residential vs commercial, service vs install) and a draft quote
can be generated against explicit pricing rules, the rest of the
business reorganizes around it:

- Dispatch becomes a constraint-solver, not a phone-based whiteboard.
- The tech's job brief becomes a deterministic output of the
  classification + customer history.
- The AR cycle becomes a state machine the agent runs.

Without classify-and-quote, every other automation is bolt-on.
With it, the workflow has a spine.

## The metric that proves it worked

Three numbers, none of them "hours saved":

1. **Time from call to scheduled appointment**: was 18 hours
   (call-to-callback-to-quote-to-confirmation). Target: under 2
   minutes.
2. **First-time-fix rate**: was 71% (tech arrives without the right
   part 29% of the time). Target: 92%+ (parts pre-allocated based
   on history).
3. **Revenue per technician per month**: was $42,000. Target:
   $58,000+ (less driving, faster scheduling, more jobs per day).

The AI-native version of this company runs with 12 people instead
of 30 and clears the same revenue. That's not a productivity bump.
That's a different company. The shape Isenberg's writing keeps
pointing at: small teams. Narrow markets. Proprietary workflows.
High automation. High trust. Clear customer pain. Boring category.
Beautiful margins.

## What this case study teaches

Three observations that generalize:

- **The administrative work is the cost.** The technical work
  (fixing the AC) was always the easy part. What killed margins
  was the coordination around it. AI-native rebuilds attack the
  coordination, not the craft.
- **The owner's head is the bottleneck.** Every old service
  business has an owner who knows everything and can't be cloned.
  AI-native rebuilds force the owner to write down what he knows —
  not for documentation's sake, but because the agent needs it.
- **Pricing rules first, everything else second.** Every automation
  downstream depends on the agent being able to quote. If you can't
  encode the pricing logic, you can't go AI-native. If you can,
  everything else falls into place.

In the next case (insurance brokerage), the same three patterns
repeat with different surface area.
