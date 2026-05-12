---
xp: 1
estSeconds: 200
concept: case-study-recruiting
---

# Case 3: Recruiting firm (technical roles, $250K+)

A 25-person tech recruiting firm. $8M revenue. Places senior
engineers, engineering managers, and CTOs at venture-backed
startups. Average placement fee: $40K. Average placement cycle:
3-4 months. Recruiters earn commission on closes. The job is
40% sourcing (finding candidates), 30% screening (initial calls),
20% client management (interfacing with the hiring company), and
10% closing (the actual offer and negotiation).

The recruiting-industry version of the AI-native thesis (echoing
Isenberg's writing on AI-native services):

> Agents source candidates, enrich profiles, compare against role
> requirements, draft outreach, summarize interviews, check
> references, update pipelines, and alert humans when a candidate
> is unusually strong. The recruiter stops being a data janitor and
> becomes a relationship closer.

## The old workflow

The client posts a job. Recruiter reads the JD. Recruiter logs into
LinkedIn Recruiter and searches. Spends three hours scrolling
profiles. Adds 50 candidates to a "to outreach" list in Notion.
Drafts an outreach email per candidate (each one slightly tweaked
to feel personal). Sends. Gets 3 replies. Schedules screening calls.
Does the screening calls. Writes up notes in the ATS (when she
remembers to). Sends the strongest 5 candidates to the client.
Client picks 2 to interview. Interviews happen. Client picks one.
Reference checks. Offer. Negotiation. Close. Move on to the next
job, which has been sitting unopened in the recruiter's inbox for
three weeks.

The same recruiter works on 4-6 active searches at a time. Each
search takes 60-80 hours. Most of those hours are not negotiation,
not relationship work, not judgment. Most of those hours are
sourcing-screening-notetaking-updating, in some combination.

## The AI-native version

The agent owns the entire top-of-funnel:

- **Sourcing**: agent reads the JD, generates the candidate
  profile, and searches across LinkedIn, GitHub, conference
  speaker lists, prior placement databases, and the recruiter's
  own network graph. Surfaces 50-200 candidates per search.
- **Enrichment**: agent enriches each candidate with their
  current company, prior roles, code repos, conference talks,
  geographic flexibility signals, compensation signals, and
  any signal that they're open to a move (Twitter post about
  burnout, last LinkedIn update, prior moves at similar tenure).
- **Outreach**: agent drafts a personalized message per candidate.
  The recruiter reviews and either approves or tweaks before
  send. (This is an "approval where judgment matters" case — the
  outreach has the recruiter's name on it, so she gets to gate it.)
- **Screening prep**: agent prepares a one-page brief for every
  inbound reply: candidate's history, talking points, likely
  objections, comp anchor, expected questions.
- **Post-call summary**: recruiter takes the call. Agent listens
  via transcription (recorded with consent). Generates the
  structured summary, updates the ATS, scores the candidate
  against the JD rubric, and flags interview readiness.
- **Client memo**: agent generates the "top 5 candidates" memo
  for the client, structured the way the client likes (some
  clients want a single-page summary; some want a deep packet;
  the agent learns).
- **Reference checking**: agent drafts reference outreach,
  schedules calls, summarizes the conversations, and flags any
  yellow flags.

The recruiter does the screening conversation, the client
relationship, the offer negotiation, and the close. The agent does
everything else.

A senior recruiter who used to run 4-6 searches at a time can now
run 12-18. The firm's revenue per recruiter triples. The firm goes
from 25 people to 15 (the data-janitor roles vanish) and revenue
goes UP. Net margin moves from 18% to 42%.

## Where the wedge is

The big-rock automation is **screening summary + ATS update**.
Recruiters write half their hours into the ATS. If the agent does
that automatically from the call, every other piece of the workflow
gets faster:

- Outreach quality goes up because there's better data on the
  candidate.
- Client memos get generated cleanly because the ATS is actually
  current.
- Pipeline reviews stop being archaeology.

The second big-rock is **personalized outreach at volume**. The old
recruiter sent 50 emails a week. The agent-supervised recruiter
sends 250 a week with higher reply rates because each one is
properly personalized.

## The metric that proves it worked

1. **Reply rate to cold outreach**: was 6% (recruiter writing tired
   emails at 4pm). Target: 14%+ (every email is properly
   personalized; recruiter just approves).
2. **Searches per recruiter per quarter**: was 5. Target: 15-20.
3. **Time-to-first-submit**: was 18 days (sourcing took forever).
   Target: 4 days.

## What this case study teaches

- **Top-of-funnel is the agent's home turf.** Anywhere the work is
  "find candidates / leads / accounts / documents and enrich
  them," agents win immediately. The recruiter's job becomes a
  relationship job, which is what good recruiters always wanted
  it to be.
- **Personalization at volume is the unlock.** The old constraint
  was "you can't write 250 personalized emails a week." Agents
  remove that constraint. The recruiter still writes the
  personality; the agent fills in the facts.
- **The ATS-as-bottleneck problem is everywhere.** Every customer-
  facing business has this in some shape (CRM data debt, customer
  history scattered across tools, "the truth lives in someone's
  inbox"). Solving it is half the AI-native rebuild.
