/**
 * Minimal, dependency-free GitHub REST client for the peoplehub MCP server.
 * Mirrors the fetch/aggregation logic in src/lib/{github,events}.ts but runs
 * standalone under Node (no browser/localStorage assumptions).
 */

const GITHUB_API = 'https://api.github.com'
const FETCH_TIMEOUT_MS = 10_000

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''

function headers() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'peoplehub-mcp/1.0',
    ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { headers: headers(), signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch public events for a user (stars/forks and everything else). */
export async function getUserEvents(username, page = 1) {
  const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/** Fetch repo metadata (description, language, stars) for better search matching. */
const repoMetaCache = new Map()

export async function getRepoMetadata(fullName) {
  if (repoMetaCache.has(fullName)) return repoMetaCache.get(fullName)

  const url = `${GITHUB_API}/repos/${fullName}`
  let result = null
  try {
    const res = await fetchWithTimeout(url)
    if (res.ok) {
      const raw = await res.json()
      result = {
        fullName: raw.full_name ?? fullName,
        description: raw.description ?? null,
        language: raw.language ?? null,
        topics: Array.isArray(raw.topics) ? raw.topics : [],
        stargazersCount: Number(raw.stargazers_count ?? 0),
        htmlUrl: raw.html_url ?? `https://github.com/${fullName}`,
      }
    }
  } catch {
    result = null
  }

  repoMetaCache.set(fullName, result)
  return result
}

/**
 * Fetch and aggregate recent star/fork activity for a list of GitHub usernames.
 * Returns one entry per (repo, day, type) bucket with the actors involved,
 * matching the shape used by the peoplehub web app's feed.
 */
export async function fetchTeamFeed(usernames, { pagesPerUser = 1, batchSize = 5 } = {}) {
  const allEvents = []

  for (let i = 0; i < usernames.length; i += batchSize) {
    const batch = usernames.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async username => {
        const events = []
        for (let page = 1; page <= pagesPerUser; page++) {
          const pageEvents = await getUserEvents(username, page)
          events.push(...pageEvents)
          if (pageEvents.length < 100) break
        }
        return events
      })
    )
    results.forEach(evts => allEvents.push(...evts))
  }

  const filtered = allEvents.filter(e => e.type === 'WatchEvent' || e.type === 'ForkEvent')

  const seen = new Set()
  const deduped = filtered.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  const groups = new Map()
  for (const event of deduped) {
    const type = event.type === 'WatchEvent' ? 'star' : 'fork'
    const repoName = event.repo.name
    const key = `${repoName}:${type}`

    let group = groups.get(key)
    if (!group) {
      group = {
        type,
        repoFullName: repoName,
        repoHtmlUrl: `https://github.com/${repoName}`,
        actors: new Map(),
        latestAt: event.created_at,
      }
      groups.set(key, group)
    }
    group.actors.set(event.actor.login, event.actor.login)
    if (event.created_at > group.latestAt) group.latestAt = event.created_at
  }

  const items = Array.from(groups.values()).map(g => ({
    type: g.type,
    repo: { fullName: g.repoFullName, htmlUrl: g.repoHtmlUrl },
    actors: Array.from(g.actors.values()),
    latestAt: g.latestAt,
  }))

  items.sort((a, b) => b.latestAt.localeCompare(a.latestAt))
  return items
}
