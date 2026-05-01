#!/usr/bin/env node
/**
 * generate-rss.mjs
 * Fetches recent stars/forks from CNCF community seed users and writes
 * public/rss.xml. Run as a pre-build step in CI (GITHUB_TOKEN is always
 * available in Actions). Output lands in dist/ via Vite's public/ copy.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

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
  'User-Agent': 'awesome-cncf-rss/1.0',
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

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildRss(items) {
  const now = new Date().toUTCString()
  const itemsXml = items.slice(0, 50).map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    </item>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>awesome-cncf — CNCF community feed</title>
    <link>https://castrojo.github.io/peoplehub/</link>
    <description>What the CNCF community is starring and forking on GitHub</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://castrojo.github.io/peoplehub/rss.xml" rel="self" type="application/rss+xml"/>
    <ttl>360</ttl>
${itemsXml}
  </channel>
</rss>`
}

async function main() {
  console.log(`Fetching events for ${SEED_USERS.length} seed users…`)
  if (!TOKEN) console.warn('Warning: no GITHUB_TOKEN — unauthenticated (60 req/hr limit)')

  // Fetch in batches of 5 to avoid secondary rate limiting
  const allEvents = []
  for (let i = 0; i < SEED_USERS.length; i += 5) {
    const batch = SEED_USERS.slice(i, i + 5)
    const results = await Promise.all(batch.map(fetchUserEvents))
    results.forEach(evts => allEvents.push(...evts))
  }

  // Filter to stars and forks only
  const filtered = allEvents.filter(e => e.type === 'WatchEvent' || e.type === 'ForkEvent')

  // Deduplicate by id
  const seen = new Set()
  const deduped = filtered.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  // Sort by date descending
  deduped.sort((a, b) => b.created_at.localeCompare(a.created_at))

  // Build RSS items
  const items = deduped.map(e => {
    const repoName = e.repo.name
    const repoUrl = `https://github.com/${repoName}`
    const actor = e.actor.login
    const verb = e.type === 'WatchEvent' ? 'starred' : 'forked'
    return {
      title: `${actor} ${verb} ${repoName}`,
      link: repoUrl,
      description: `${actor} ${verb} https://github.com/${repoName}`,
      date: e.created_at,
    }
  })

  const xml = buildRss(items)

  mkdirSync(join(ROOT, 'public'), { recursive: true })
  writeFileSync(join(ROOT, 'public', 'rss.xml'), xml, 'utf8')
  console.log(`✓ Written public/rss.xml (${items.length} items, ${deduped.length} events)`)
}

main().catch(err => {
  console.error('RSS generation failed:', err.message)
  // Non-fatal — don't fail the build if RSS generation fails
  process.exit(0)
})
