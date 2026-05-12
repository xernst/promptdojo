# Bot Observability Spec

**Date**: 2026-05-11
**Owner**: Josh
**Status**: staged for Week 2 build (per LAUNCH-V2.md §19.6 item 6)
**Failure mode this defends**: F6 — Twitter bot dies silently at 60-day OAuth rotation

## Why this exists

The premortem (`~/Obsidian/v01/20-Projects/promptdojo/premortem-report-20260511-1709.html`) traced F6 to one specific bug: the monitor-ping wired into the auto-tweet GitHub Action only fires on the success branch. When OAuth 1.0a tokens rotate (X has been aggressively rotating since 2024), the bot 401s, the success branch never runs, the monitor never gets a ping, and the alert lands in `josh@promptdojo.dev` — a domain inbox Josh doesn't actively read.

Result in the premortem timeline: 3 weeks of silent zero-content. Algorithm decays. 1,000-follower gate slips out of reach.

This spec closes that gap with four signals:
1. Monitor-ping fires on **both** success and failure paths.
2. Failures post to the **Telegram Errors topic** (the channel Josh reads daily).
3. Token age is **proactively** warned at day 55, before the day-60 rotation hits.
4. `last_successful_post` timestamp surfaces on Josh's morning brief — 48h gap = impossible to miss.

---

## 1. Telegram Errors topic webhook

### 1a. Existing config (audited 2026-05-11)

Searched `~/.claude/CLAUDE.md`, `~/.claude/projects/-Users-joshernst/memory/*.md`, `~/.claude/channels/telegram/`. Findings:

- The Telegram routing rule is in `~/.claude/rules/topic-routing.md`. It defines 5 topics: Main, Daily Briefs, Swarm Coordination, Approvals, **Errors**.
- Errors topic content per the rule: "MCP server failures, SSH connection failures, watchdog health check failures, Obsidian vault sync errors, tool invocation errors, any ❌ Status output."
- The Telegram channel plugin scaffold exists at `~/.claude/channels/telegram/` but `.env` and `access.json` are **not yet present**. Josh hasn't pasted his bot token into the plugin config.
- The plugin's bot token would live at `~/.claude/channels/telegram/.env` as `TELEGRAM_BOT_TOKEN=...`.

**Net**: Josh needs to fill in three things before this spec is executable. Treat them as placeholders for now.

### 1b. Placeholders Josh fills in

| Placeholder | Where to get it | Where it lives |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather → /newbot or existing token | GitHub Actions secret (NOT the plugin's local `.env` — secrets must be in CI for the bot to use them) |
| `TELEGRAM_CHAT_ID` | The chat ID of Josh's bot conversation (group, supergroup, or DM). DM a message to the bot, then `curl https://api.telegram.org/bot<TOKEN>/getUpdates` and read `result[0].message.chat.id`. | GitHub Actions secret |
| `TELEGRAM_ERRORS_TOPIC_ID` | If the chat is a supergroup with topics enabled, send a message manually in the Errors topic and check `getUpdates` for `message_thread_id`. If chat is a plain DM, set this to empty and the API call omits the field. | GitHub Actions secret |

### 1c. Webhook URL pattern

The Telegram Bot API call to post a message to a specific topic:

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "'"${TELEGRAM_CHAT_ID}"'",
    "message_thread_id": '"${TELEGRAM_ERRORS_TOPIC_ID}"',
    "text": "❌ promptdojo bot failed at '"${TIMESTAMP}"'. run: '"${GITHUB_RUN_URL}"'",
    "parse_mode": "Markdown"
  }'
```

If chat is a plain DM (no topics), drop the `message_thread_id` field entirely. The webhook URL pattern stays the same: `https://api.telegram.org/bot<TOKEN>/sendMessage`.

---

## 2. GitHub Action snippet for the daily auto-tweet bot

### 2a. Critical fix vs the plan-as-written

The plan's original Week 2 phrasing: "monitor ping on success." That's the F6 bug. The correction: **monitor-ping fires on both success AND failure paths**. On failure, also post the alert to Telegram.

### 2b. The workflow

File: `.github/workflows/daily-auto-tweet.yml`. The directory `.github/workflows/` does NOT exist today per /autoplan §18.1 — this is greenfield.

```yaml
name: daily-auto-tweet
on:
  schedule:
    - cron: "0 13 * * *"  # 9am ET = 13:00 UTC during EDT; adjust to 14:00 UTC if shipping during EST window
  workflow_dispatch:  # so Josh can force-run

permissions:
  contents: read

jobs:
  post:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      status: ${{ steps.post.outcome }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - run: pnpm install --frozen-lockfile

      - name: post the bug of the day
        id: post
        env:
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
          TWITTER_ACCESS_TOKEN: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          TWITTER_ACCESS_SECRET: ${{ secrets.TWITTER_ACCESS_SECRET }}
        run: node scripts/post-daily-bug.mjs

      - name: write last_successful_post timestamp
        if: success()
        run: |
          mkdir -p .state
          date -u +"%Y-%m-%dT%H:%M:%SZ" > .state/last_successful_post
          git config user.name "promptdojo-bot"
          git config user.email "bot@promptdojo.dev"
          git add .state/last_successful_post
          git diff --staged --quiet || git commit -m "bot: successful post $(cat .state/last_successful_post)"
          git push

      - name: notify on success (monitor ping)
        if: success()
        run: |
          curl -fsS -X POST \
            "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -H "Content-Type: application/json" \
            -d "{\"chat_id\":\"${{ secrets.TELEGRAM_CHAT_ID }}\",\"text\":\"✅ daily-auto-tweet shipped $(date -u +'%H:%MZ')\"}"

      - name: notify on failure (THE F6 FIX)
        if: failure()
        run: |
          curl -fsS -X POST \
            "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -H "Content-Type: application/json" \
            -d "{
              \"chat_id\":\"${{ secrets.TELEGRAM_CHAT_ID }}\",
              \"message_thread_id\": ${{ secrets.TELEGRAM_ERRORS_TOPIC_ID }},
              \"text\":\"❌ promptdojo daily-auto-tweet FAILED\\nrun: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}\\nrotate OAuth tokens if it's been ~60 days\"
            }"
```

### 2c. Why this works

- `if: success()` and `if: failure()` are mutually exclusive GitHub Actions conditionals. Exactly one fires per run. The failure branch is the F6 fix.
- The success branch double-writes: posts to Telegram Main (light green check) AND commits `.state/last_successful_post` to the repo. The repo commit is what `morning-brief` reads (see §4 below).
- `curl -fsS` exits non-zero if Telegram itself 4xx/5xxs, which surfaces a yellow build (bot worked, alerts didn't). If you want bot success not to be masked by Telegram failure, swap `-fsS` for `-sS` so the curl always succeeds.
- If `TELEGRAM_ERRORS_TOPIC_ID` is empty/null (DM only, no topics), drop that JSON field. Simplest version: parameterize the JSON construction in a small node script and write either-with-or-without the topic field.

### 2d. Twitter OAuth 1.0a secrets — where each comes from

Per /autoplan §18.1: POST `/2/tweets` requires OAuth 1.0a User Context, NOT Bearer. Four secrets, not one:

1. **TWITTER_API_KEY** + **TWITTER_API_SECRET** — Twitter Developer Portal → your project → "Keys and tokens" → "Consumer Keys" (App-level credentials). These identify the app.
2. **TWITTER_ACCESS_TOKEN** + **TWITTER_ACCESS_SECRET** — Same page, "Authentication Tokens" section → "Access Token and Secret" → Generate. **Set permissions to Read+Write BEFORE generating** — if generated with Read-only, the POST will 403 and you have to regenerate. These identify the user (@TFisPython).

Then `scripts/post-daily-bug.mjs` uses an OAuth 1.0a signing library (e.g. `oauth-1.0a` from npm) to sign the POST. Sample minimal flow:

```js
import OAuth from "oauth-1.0a";
import crypto from "node:crypto";

const oauth = OAuth({
  consumer: { key: process.env.TWITTER_API_KEY, secret: process.env.TWITTER_API_SECRET },
  signature_method: "HMAC-SHA1",
  hash_function(base, key) {
    return crypto.createHmac("sha1", key).update(base).digest("base64");
  },
});

const url = "https://api.twitter.com/2/tweets";
const token = { key: process.env.TWITTER_ACCESS_TOKEN, secret: process.env.TWITTER_ACCESS_SECRET };
const req = { url, method: "POST", data: undefined };  // OAuth signature uses url+method, not body
const authHeader = oauth.toHeader(oauth.authorize(req, token)).Authorization;

const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: authHeader, "Content-Type": "application/json" },
  body: JSON.stringify({ text: tweetText }),
});

if (!res.ok) {
  const body = await res.text();
  console.error("twitter post failed", res.status, body);
  process.exit(1);  // non-zero so the workflow's `if: failure()` fires
}
```

Monthly cap (free tier, 2026): 500 POST /tweets per month. Daily cadence = 30/month at most. Well inside.

### 2e. Twitter API runtime test before scheduling

Before turning on the cron, run the workflow manually via the **workflow_dispatch** trigger with a test tweet ("hello from the bot, this is a test, delete me"). Confirm:
- Tweet appears on @TFisPython.
- `.state/last_successful_post` gets committed.
- Telegram Main receives the ✅ message.
- Delete the test tweet manually.

Then force a failure (set `TWITTER_API_KEY` secret to garbage temporarily) and run again. Confirm:
- Workflow fails.
- Telegram Errors topic receives the ❌ message with the run URL.
- Restore the real key.

If either test path doesn't land, the bot ships broken. Don't enable the schedule until both are green.

---

## 3. Token-age check (weekly cron)

Separate workflow. Fires once a week. If the access token is older than 55 days, warns Telegram Errors that rotation is due within 5 days.

### 3a. How to know token age

Twitter doesn't expose token issue date via API. Track it manually: when Josh generates tokens, he writes the date to `.state/twitter_token_rotated_on`:

```
2026-05-11
```

The weekly workflow reads that file, computes days since, and alerts if >55.

### 3b. The workflow

File: `.github/workflows/token-age-check.yml`

```yaml
name: token-age-check
on:
  schedule:
    - cron: "0 14 * * 1"  # Mondays 10am ET / 14:00 UTC
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - uses: actions/checkout@v4

      - name: compute token age
        id: age
        run: |
          if [ ! -f .state/twitter_token_rotated_on ]; then
            echo "days=999" >> "$GITHUB_OUTPUT"
            echo "no .state/twitter_token_rotated_on file — assuming rotation overdue"
            exit 0
          fi
          rotated_on=$(cat .state/twitter_token_rotated_on)
          days=$(( ( $(date -u +%s) - $(date -u -d "$rotated_on" +%s) ) / 86400 ))
          echo "days=$days" >> "$GITHUB_OUTPUT"
          echo "twitter token is $days days old"

      - name: warn at day 55
        if: ${{ fromJSON(steps.age.outputs.days) > 55 }}
        run: |
          curl -fsS -X POST \
            "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -H "Content-Type: application/json" \
            -d "{
              \"chat_id\":\"${{ secrets.TELEGRAM_CHAT_ID }}\",
              \"message_thread_id\": ${{ secrets.TELEGRAM_ERRORS_TOPIC_ID }},
              \"text\":\"⚠️ promptdojo twitter token is ${{ steps.age.outputs.days }} days old. rotate within 5 days. portal: https://developer.twitter.com/en/portal/dashboard\"
            }"
```

When Josh rotates, he updates `.state/twitter_token_rotated_on` to today's date, commits, pushes. Counter resets.

---

## 4. `last_successful_post` timestamp on morning brief

Per CLAUDE.md, Josh has a "Daily Briefs" Telegram topic that receives morning summaries. The /standup skill drives it.

### 4a. What to surface

The age of `.state/last_successful_post` in the repo. If older than 48 hours, flag prominently.

### 4b. How the morning brief reads it

Add this to the /standup skill's data-collection phase (or wherever the brief assembles):

```bash
# In ~/.claude/projects/-Users-joshernst/ or wherever the brief data is assembled
LAST_POST_FILE=~/Developer/promptdojo/.state/last_successful_post
if [ -f "$LAST_POST_FILE" ]; then
  last=$(cat "$LAST_POST_FILE")
  last_epoch=$(date -u -d "$last" +%s 2>/dev/null || date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$last" +%s)
  age_hours=$(( ( $(date -u +%s) - last_epoch ) / 3600 ))
  if [ "$age_hours" -gt 48 ]; then
    echo "🚨 promptdojo bot: last successful post was ${age_hours}h ago. check the action."
  else
    echo "✅ promptdojo bot: last post ${age_hours}h ago."
  fi
fi
```

Put this output in the standup brief assembly so it lands in the Daily Briefs topic each morning. If the bot dies, Josh sees 🚨 within 24 hours instead of 3 weeks.

### 4c. Why three signals instead of one

- Telegram Errors topic = immediate alert on failure (next cron tick).
- Morning brief 🚨 = catches the case where the failure ALSO doesn't fire (Telegram outage, secret deleted, action disabled).
- 48-hour gap = covers daily cron skips (e.g., Josh manually disabled it for a week, then forgot to re-enable).

Three signals means losing one of them doesn't take down the safety net.

---

## 5. OAuth 1.0a setup — full checklist

Before the bot can ship, Josh needs:

- [ ] Twitter Developer Portal account at https://developer.twitter.com/en/portal/dashboard (Free tier is sufficient — 500 posts/month cap)
- [ ] A "Project" with an "App" inside it
- [ ] App permissions set to **Read and Write** (NOT Read only) — critical, set BEFORE generating tokens
- [ ] Consumer Keys generated → `TWITTER_API_KEY`, `TWITTER_API_SECRET`
- [ ] Access Token + Secret generated → `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
- [ ] All four pasted into GitHub Actions secrets (repo → Settings → Secrets and variables → Actions)
- [ ] `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ERRORS_TOPIC_ID` pasted as GH Actions secrets too
- [ ] Date of rotation written to `.state/twitter_token_rotated_on` (committed to main)
- [ ] `scripts/post-daily-bug.mjs` written (reads from `content/bugs/`, signs OAuth 1.0a, POSTs to /2/tweets)
- [ ] `oauth-1.0a` npm package added as dependency
- [ ] Workflow tested via workflow_dispatch with both happy-path AND forced-failure (per §2e)
- [ ] Schedule enabled (cron line uncommented)

Only flip on the schedule when every box above is checked. F6 is exactly what happens when you ship before §2e is verified.

---

## What this spec does NOT cover (deliberately)

- The `scripts/post-daily-bug.mjs` content selection logic (picks the next bug from `content/bugs/YYYY-MM-DD.md`). That's part of the content engine, separate from observability.
- The pre-bank of 60 bug markdowns. That's Week 1-2 content work, not plumbing.
- LinkedIn auto-posting. Out of scope for v1 launch; the LinkedIn cadence stays manual per the plan.
- Discord bot. Separate concern, deferred.

---

## Coordination with other plumbing

This spec depends on:
- `docs/week-1-execution-pack.md` — Week 1 plumbing must land first (vitest scaffold lets us test the OAuth signing logic; subscribe.ts 502 fix establishes the "monitors get truthful status codes" pattern this spec extends).
- `audience-auditor`'s Task #1 verdict — if <15% wedge match, the bot is paused per the pivot runbook (the Day 3 gate in /caught/[slug] design). The spec is still written; only the cron enable date moves.

If `viral-architect` lands a `/caught/[slug]` design that needs the bot to share a URL with `?n=` query (per /autoplan D1), the `scripts/post-daily-bug.mjs` will need to construct that URL. Coordinate with them before writing the script.
