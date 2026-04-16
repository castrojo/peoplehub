# peoplehub

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
