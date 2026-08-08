#!/usr/bin/env node
/**
 * slack-bot.mjs
 * Fetches recent star/fork activity from CNCF community seed users and posts
 * a daily trending summary to Slack via an Incoming Webhook.
 *
 * Config (env vars):
 *  - SLACK_WEBHOOK_URL   (required) Incoming webhook URL for the target Slack app.
 *  - SLACK_CHANNEL       (optional) Channel to post to, e.g. "#cncf-trends".
 *                        Only takes effect if the webhook's Slack app allows
 *                        posting to arbitrary channels; otherwise it posts to
 *                        the channel configured on the webhook itself.
 *  - TRENDING_WINDOW_DAYS (optional) Days of activity to summarize. Default: 1.
 *  - TRENDING_TOP_N      (optional) Number of repos to include. Default: 10.
 *  - GITHUB_TOKEN / GH_TOKEN (optional) Used to raise the GitHub API rate limit.
 *
 * Run on a schedule (see .github/workflows/slack-bot.yml) or manually via
 * `node scripts/slack-bot.mjs`.
 */

const SEED_USERS = [
  'caniszczyk', 'castrojo', 'thockin', 'bgrant0607', 'jbeda',
  'brendandburns', 'liggitt', 'kelseyhightower', 'dims', 'nikhita',
  'deads2k', 'smarterclayton', 'eddiezane', 'lachie83', 'dlorenc',
  'hawkw', 'jessfraz', 'aojea', 'sttts', 'spiffxp',
  'vincepri', 'justinsb', 'bobbypage', 'timja', 'ryantking',
]

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'peoplehub-slack-bot/1.0',
  ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
}

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || ''
const WINDOW_DAYS = Number(process.env.TRENDING_WINDOW_DAYS || 1)
const TOP_N = Number(process.env.TRENDING_TOP_N || 10)

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

/**
 * Aggregate raw GitHub events into a per-repo leaderboard of unique
 * stargazers/forkers within the given time window.
 */
function computeTrending(events, windowDays) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)

  const byRepo = new Map()

  for (const e of events) {
    if (e.type !== 'WatchEvent' && e.type !== 'ForkEvent') continue
    if (new Date(e.created_at) < cutoff) continue

    const repoName = e.repo.name
    let entry = byRepo.get(repoName)
    if (!entry) {
      entry = {
        repo: repoName,
        url: `https://github.com/${repoName}`,
        stargazers: new Set(),
        forkers: new Set(),
        latestAt: e.created_at,
      }
      byRepo.set(repoName, entry)
    }

    if (e.type === 'WatchEvent') entry.stargazers.add(e.actor.login)
    else entry.forkers.add(e.actor.login)

    if (e.created_at > entry.latestAt) entry.latestAt = e.created_at
  }

  return Array.from(byRepo.values())
    .map(entry => ({
      repo: entry.repo,
      url: entry.url,
      starCount: entry.stargazers.size,
      forkCount: entry.forkers.size,
      total: entry.stargazers.size + entry.forkers.size,
      people: [...new Set([...entry.stargazers, ...entry.forkers])],
    }))
    .sort((a, b) => b.total - a.total)
}

function buildSlackMessage(trending, windowDays, topN) {
  const label = windowDays === 1 ? 'today' : `the last ${windowDays} days`
  const top = trending.slice(0, topN)

  if (top.length === 0) {
    return {
      channel: SLACK_CHANNEL || undefined,
      text: `No new stars or forks from the CNCF community ${label}.`,
    }
  }

  const lines = top.map((entry, i) => {
    const bits = []
    if (entry.starCount) bits.push(`⭐ ${entry.starCount}`)
    if (entry.forkCount) bits.push(`🍴 ${entry.forkCount}`)
    const who = entry.people.slice(0, 3).join(', ') + (entry.people.length > 3 ? `, +${entry.people.length - 3} more` : '')
    return `${i + 1}. <${entry.url}|${entry.repo}> — ${bits.join('  ')}  _(${who})_`
  })

  const summaryText = `📈 *CNCF community trending — ${label}*\n\n${lines.join('\n')}`

  return {
    channel: SLACK_CHANNEL || undefined,
    text: `CNCF community trending — ${label}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: summaryText },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Tracking ${SEED_USERS.length} community members · <https://castrojo.github.io/peoplehub|View full feed>`,
          },
        ],
      },
    ],
  }
}

async function postToSlack(message) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Slack webhook returned ${res.status}: ${body}`)
  }
}

async function main() {
  if (!WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL is not set — skipping Slack post.')
    process.exit(1)
  }

  console.log(`Fetching events for ${SEED_USERS.length} seed users…`)
  if (!TOKEN) console.warn('Warning: no GITHUB_TOKEN — unauthenticated (60 req/hr limit)')

  const allEvents = []
  for (let i = 0; i < SEED_USERS.length; i += 5) {
    const batch = SEED_USERS.slice(i, i + 5)
    const results = await Promise.all(batch.map(fetchUserEvents))
    results.forEach(evts => allEvents.push(...evts))
  }

  const trending = computeTrending(allEvents, WINDOW_DAYS)
  const message = buildSlackMessage(trending, WINDOW_DAYS, TOP_N)

  await postToSlack(message)
  console.log(`✓ Posted trending summary to Slack (${trending.length} repos with activity, top ${TOP_N} shown).`)
}

main().catch(err => {
  console.error('Slack bot failed:', err.message)
  process.exit(1)
})
