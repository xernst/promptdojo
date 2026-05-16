# Homepage copy (Task 7)

Final copy for the promptdojo homepage. Each section below maps to one block on
the page. The Platform team wires this into `app/page.tsx`; the words are final,
the layout is theirs. All headlines lowercase. No em dashes. No pricing tier.

Voice: direct, conversational, second person. The reader clicked a link because
their job feels different than it did a year ago. Talk to that person.

---

## Section: page meta

- **Page title:** promptdojo, the free python school for the AI era
- **Meta description:** AI is reshaping every job. promptdojo teaches you to build with it: read what AI writes, catch what it gets wrong, and ship real work. Free for individuals, forever.

---

## Section: hero

- **Headline:** everyone's a builder now
- **Subheading:** your job just changed. learn to build with AI or fall behind.
- **Supporting line:** 31 chapters. 833 runnable steps. runs in your browser. free for individuals, forever.
- **Primary CTA:** start learning free
- **Secondary CTA:** for teams

---

## Section: the thesis

Headline: **why this exists**

AI is reshaping every job. Not someday. Now.

The people who stay valuable are the ones who can work with AI deliberately:
point it at real work, read what it writes back, and catch what it got wrong.
That used to be a programmer's skill. It's everyone's skill now. Marketers,
lawyers, designers, ops people, support teams. The job changed under all of you
at once.

promptdojo teaches that skill, from zero. We built it free for individuals, and
we're keeping it that way, because the next five years are going to be brutal
for anyone who can't work with AI tools, and a paywall on the way out of that is
the last thing people need.

---

## Section: how it works

Headline: **how it works**

- **Pick your path.** Ten career paths, each a curated route through the
  chapters that matter for your role. You're not handed a generic syllabus.
- **Take a quick placement.** A short survey, then a path quiz. They set your
  starting point and let you skip what you already know.
- **Learn by doing.** Every chapter runs in your browser. You read real
  AI-written code, predict what it does, find the bug, and fix it. No installs,
  no setup, nothing to configure.
- **Two speeds, your call.** Every chapter comes in a beginner version and a
  faster version. Switch any time. The course meets you where you are.

---

## Section: career paths grid

Headline: **find your path**
Intro line: ten roles, ten routes through the course. pick the one closest to
your work. each one ends with something you can actually do.

Each card: role name, one-line value prop, estimated time, and an "explore path"
link. Icon suggestions are in brackets for the design team; promptdojo uses no
emoji, so these are concepts, not characters.

| Path | One-line value prop | Time | Link | [icon idea] |
|---|---|---|---|---|
| developer | go from zero to reading, debugging, and shipping real software with AI. | 20 to 24 hours | explore path | [terminal caret] |
| marketer | build AI content pipelines and generate campaign creative at scale. | 10 to 12 hours | explore path | [megaphone] |
| designer | generate assets in batches and wire AI image and video into your workflow. | 9 to 11 hours | explore path | [layers] |
| customer service | build and monitor support agents that catch their own mistakes. | 12 to 14 hours | explore path | [headset] |
| copywriter | run AI writing pipelines that hold your brand voice and survive a fact-check. | 10 to 12 hours | explore path | [pen nib] |
| data analyst | pull, clean, and analyze data with AI doing the grunt work. | 13 to 15 hours | explore path | [bar chart] |
| project manager | direct AI builds, review the output, and ship internal tools yourself. | 12 to 14 hours | explore path | [checklist] |
| hr specialist | deploy team skills and set the rules for how your org uses AI. | 9 to 11 hours | explore path | [people] |
| operations | automate the repetitive work your department runs on. | 16 to 18 hours | explore path | [gears] |
| lawyer | build document-review tools and catch the citations AI invents. | 13 to 15 hours | explore path | [scales] |

---

## Section: enterprise training

Headline: **for teams**

The same course, built for whole teams.

When AI reshapes a role, it reshapes it for everyone in that role at once.
Reskilling one person at a time doesn't keep up. promptdojo for teams puts the
ten career paths in front of your whole organization, with the parts a company
actually needs:

- **Accountability.** Assign paths by role. See who started, who is moving, and
  who is stuck.
- **Completion tracking.** Real progress data, not a pile of unused logins.
- **Curated routes.** Each role gets the chapters that matter for its work, not
  a generic syllabus.

And the part worth saying plainly: buying promptdojo for your team is what keeps
the platform free for everyone else. There's no individual paywall, and there
won't be one. Companies fund the free version by training their own people on
it. That's the whole model.

- **CTA:** talk to us about your team
- **CTA behavior:** opens a contact form. No public per-seat pricing. Pricing is
  a conversation, scoped to team size and rollout.

---

## Section: closing CTA

Headline: **the job already changed. start.**

Subline: free for individuals, forever. no account wall to try it. pick a path
and go.

- **Primary CTA:** start learning free
- **Secondary CTA:** for teams

---

## Section: footer

Tagline line (also usable in meta, social, and the OG image):
**everyone needs to code now. here's how.**

---

## Notes for the Platform team

- **Removed:** the individual paid pricing tier ($9.99/mo, $59/yr, $129
  founders) and the homepage tagline "free preview, paid in the app." There is
  no individual paid tier in this copy. The `/pro` route and any pricing
  components should come down or redirect to the "for teams" contact form.
- **Removed:** any "paid app coming" or "coming soon" language. Everything named
  here ships now.
- **"for teams" CTA** goes to a contact form, not a pricing page. No per-seat
  numbers anywhere on the public site.
- **Career paths grid:** each "explore path" link points at that path's page.
  Path slugs match `docs/plan/CAREER-PATHS.md` (developer, marketer, designer,
  customer-service, copywriter, data-analyst, project-manager, hr-specialist,
  operations, lawyer).
- **Stat check before publish:** "31 chapters, 833 runnable steps" reflects the
  pre-CLI-chapters count. With the 3 new CLI chapters and the team-skills
  chapter, the real numbers are higher. Confirm the live counts with the
  Platform team and update the hero supporting line before launch.
