#!/usr/bin/env node
/**
 * slack-daily-summary.mjs
 * Posts a daily summary of the latest CNCF community trends (stars/forks
 * from the seed users) to a Slack channel via an Incoming Webhook.
 *
 * Config (all via environment variables so this can run in CI or locally):
 *   SLACK_WEBHOOK_URL   (required) Slack Incoming Webhook URL for the target channel.
 *   SLACK_CHANNEL        (optional) Channel override, e.g. "#cncf-feed".
 *                         Only works if the webhook's Slack app allows channel overrides.
 *   SLACK_USERNAME        (optional) Bot display name. Defaults to "peoplehub".
 *   SLACK_ICON_EMOJI      (optional) Bot icon emoji. Defaults to ":star:".
 *   SUMMARY_WINDOW_DAYS   (optional) Trending window in days. Defaults to 1 (daily).
 *   TOP_N                 (optional) Number of repos to include. Defaults to 5.
 *   GITHUB_TOKEN / GH_TOKEN (optional) Auth token for GitHub API to raise rate limits.
 *   DRY_RUN               (optional) If set to "true", prints the message instead of posting it.
 *
 * Run manually:
 *   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... node scripts/slack-daily-summary.mjs
 */

import { SEED_USERS } from './seed-users.mjs'

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''
const CHANNEL = process.env.SLACK_CHANNEL || ''
const USERNAME = process.env.SLACK_USERNAME || 'peoplehub'
const ICON_EMOJI = process.env.SLACK_ICON_EMOJI || ':star:'
const WINDOW_DAYS = Number(process.env.SUMMARY_WINDOW_DAYS || 1)
const TOP_N = Number(process.env.TOP_N || 5)
const DRY_RUN = String(process.env.DRY_RUN || '').toLowerCase() === 'true'
const SITE_URL = 'https://castrojo.github.io/peoplehub'

const HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'peoplehub-slack-bot/1.0',
  ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
}

async function fetchUserEvents(username) {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=30`,
      { headers: HEADERS }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/** Aggregate raw GitHub events into per-repo leaderboard entries. */
function computeLeaderboard(events) {
  const map = new Map()

  for (const e of events) {
    if (e.type !== 'WatchEvent' && e.type !== 'ForkEvent') continue

    const repoName = e.repo?.name
    const actor = e.actor?.login
    if (!repoName || !actor) continue

    let entry = map.get(repoName)
    if (!entry) {
      entry = {
        repoName,
        repoUrl: `https://github.com/${repoName}`,
        stargazers: new Set(),
        forkers: new Set(),
        latestAt: e.created_at,
      }
      map.set(repoName, entry)
    }

    if (e.type === 'WatchEvent') entry.stargazers.add(actor)
    else entry.forkers.add(actor)

    if (e.created_at > entry.latestAt) entry.latestAt = e.created_at
  }

  return Array.from(map.values())
    .map(entry => ({
      ...entry,
      starCount: entry.stargazers.size,
      forkCount: entry.forkers.size,
      totalActivity: entry.stargazers.size + entry.forkers.size,
    }))
    .sort((a, b) => b.totalActivity - a.totalActivity)
}

function buildSlackMessage(leaderboard, windowDays) {
  const label = windowDays === 1 ? 'today' : `the last ${windowDays} days`

  if (leaderboard.length === 0) {
    return {
      text: `📊 *peoplehub daily summary*: No new stars or forks from the CNCF community ${label}.`,
    }
  }

  const top = leaderboard.slice(0, TOP_N)
  const lines = top.map((entry, i) => {
    const parts = []
    if (entry.starCount > 0) parts.push(`⭐ ${entry.starCount}`)
    if (entry.forkCount > 0) parts.push(`🍴 ${entry.forkCount}`)
    return `${i + 1}. <${entry.repoUrl}|${entry.repoName}> — ${parts.join('  ')}`
  })

  const text = [
    `📊 *peoplehub daily summary* — top ${top.length} trending repo${top.length === 1 ? '' : 's'} among the CNCF community ${label}:`,
    ...lines,
    `\n<${SITE_URL}|View the full feed>`,
  ].join('\n')

  return {
    text,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📊 *peoplehub daily summary*\nTop ${top.length} trending repo${top.length === 1 ? '' : 's'} among the CNCF community ${label}:`,
        },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `<${SITE_URL}|View the full feed>` }],
      },
    ],
  }
}

async function postToSlack(payload) {
  const body = {
    ...payload,
    username: USERNAME,
    icon_emoji: ICON_EMOJI,
    ...(CHANNEL ? { channel: CHANNEL } : {}),
  }

  if (DRY_RUN || !WEBHOOK_URL) {
    console.log(DRY_RUN ? 'DRY_RUN enabled — not posting. Message:' : 'No SLACK_WEBHOOK_URL set — printing message instead:')
    console.log(JSON.stringify(body, null, 2))
    return
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Slack webhook responded ${res.status}: ${text}`)
  }

  console.log('✓ Posted daily summary to Slack')
}

async function main() {
  console.log(`Fetching events for ${SEED_USERS.length} seed users…`)
  if (!TOKEN) console.warn('Warning: no GITHUB_TOKEN — unauthenticated (60 req/hr limit)')

  const allEvents = []
  for (let i = 0; i < SEED_USERS.length; i += 5) {
    const batch = SEED_USERS.slice(i, i + 5)
    const results = await Promise.all(batch.map(fetchUserEvents))
    results.forEach(evts => allEvents.push(...evts))
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - WINDOW_DAYS)
  const cutoffIso = cutoff.toISOString()
  const recentEvents = allEvents.filter(e => e.created_at && e.created_at >= cutoffIso)

  const leaderboard = computeLeaderboard(recentEvents)
  const message = buildSlackMessage(leaderboard, WINDOW_DAYS)

  await postToSlack(message)
}

main().catch(err => {
  console.error('Slack daily summary failed:', err.message)
  process.exit(1)
})
