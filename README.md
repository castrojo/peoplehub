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

A GitHub Actions workflow (`.github/workflows/slack-daily-summary.yml`) posts a
daily summary of the top trending repos among the CNCF community (based on the
same seed-user stars/forks data as the feed) to a Slack channel via an
[Incoming Webhook](https://api.slack.com/messaging/webhooks).

### Setup

1. Create a Slack Incoming Webhook for the channel you want announcements in.
2. In the repo settings, add it as the `SLACK_WEBHOOK_URL` secret.
3. Optionally configure these repository variables:
   - `SLACK_CHANNEL` — channel override, e.g. `#cncf-feed` (requires the webhook's app to allow overrides)
   - `SLACK_USERNAME` — bot display name (default `peoplehub`)
   - `SLACK_ICON_EMOJI` — bot icon (default `:star:`)
   - `SUMMARY_WINDOW_DAYS` — trending window in days (default `1`)
   - `TOP_N` — number of repos to include (default `5`)
4. The workflow runs daily at 14:00 UTC, or trigger it manually via
   **Actions → Slack Daily Summary → Run workflow**.

You can also run it locally:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... node scripts/slack-daily-summary.mjs

# Preview the message without posting:
DRY_RUN=true node scripts/slack-daily-summary.mjs
```
