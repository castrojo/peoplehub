# peoplehub

## CNCF, AAIF, and other Linux Foundation employee's star feeds.

A minimal GitHub discovery feed. Shows only ⭐ Stars and 🍴 Forks from people you follow — no releases, no pushes, no noise.

**Live:** https://castrojo.github.io/peoplehub

## What it does

- Fetches your GitHub received events (up to 300)
- Keeps only `WatchEvent` (starred) and `ForkEvent`
- Aggregates: "Alice, Bob, and Charlie starred X"
- Caches results for 6 hours in localStorage
- Dark/light/system theme matching GitHub's color tokens

## Setup

No server, no OAuth. Just enter your GitHub username on first visit.

## Development

```bash
npm install
npm run dev
```

## Deploy

Automatically deploys to GitHub Pages on push to `main`.

## Slack bot

A scheduled GitHub Actions workflow (`.github/workflows/slack-bot.yml`) posts a
daily summary of trending CNCF community stars/forks to Slack via an
[Incoming Webhook](https://api.slack.com/messaging/webhooks).

### Setup

1. Create a Slack app (or reuse one) with an Incoming Webhook enabled for the
   channel you want announcements posted to.
2. Add the webhook URL as a repository secret named `SLACK_WEBHOOK_URL`.
3. (Optional) Set a repository variable `SLACK_CHANNEL` to override the
   channel the webhook posts to (requires a webhook whose app allows posting
   to arbitrary channels).
4. The bot runs daily at 14:00 UTC by default, or trigger it manually from
   the Actions tab (`workflow_dispatch`), optionally overriding:
   - `window_days` — how many days of activity to summarize (default `1`)
   - `top_n` — how many repos to include (default `10`)

Run it locally with:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... node scripts/slack-bot.mjs
```
