import type { GitHubEvent, RepoMetadata, ApiResult } from '../types/github'

const GITHUB_API = 'https://api.github.com'

function getHeaders(): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function parseRetryAfter(headers: Headers): number {
  const reset = headers.get('X-RateLimit-Reset')
  if (reset) {
    const resetMs = parseInt(reset, 10) * 1000
    return Math.max(0, resetMs - Date.now())
  }
  return 60_000
}

export async function getReceivedEvents(
  username: string,
  maxPages = 3
): Promise<ApiResult<GitHubEvent[]>> {
  const allEvents: GitHubEvent[] = []

  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/received_events?per_page=100&page=${page}`

    let response: Response
    try {
      response = await fetch(url, {
        headers: getHeaders(),
        redirect: 'error',
      })
    } catch (err) {
      return { error: 'network', message: String(err) }
    }

    if (response.status === 403 || response.status === 429) {
      return { error: 'rate_limited', retryAfter: parseRetryAfter(response.headers) }
    }
    if (response.status === 404) {
      return { error: 'not_found' }
    }
    if (!response.ok) {
      return { error: 'unknown', message: `HTTP ${response.status}` }
    }

    let events: GitHubEvent[]
    try {
      events = await response.json() as GitHubEvent[]
    } catch {
      return { error: 'unknown', message: 'Failed to parse response JSON' }
    }

    allEvents.push(...events)

    // Stop paginating if we got fewer than a full page
    if (events.length < 100) break
  }

  return { data: allEvents }
}

export async function getRepoMetadata(
  fullName: string
): Promise<ApiResult<RepoMetadata>> {
  const url = `${GITHUB_API}/repos/${fullName}`

  let response: Response
  try {
    response = await fetch(url, {
      headers: getHeaders(),
      redirect: 'error',
    })
  } catch (err) {
    return { error: 'network', message: String(err) }
  }

  if (response.status === 403 || response.status === 429) {
    return { error: 'rate_limited', retryAfter: parseRetryAfter(response.headers) }
  }
  if (response.status === 404) {
    return { error: 'not_found' }
  }
  if (!response.ok) {
    return { error: 'unknown', message: `HTTP ${response.status}` }
  }

  let raw: Record<string, unknown>
  try {
    raw = await response.json() as Record<string, unknown>
  } catch {
    return { error: 'unknown', message: 'Failed to parse repo JSON' }
  }

  return {
    data: {
      fullName: String(raw['full_name'] ?? fullName),
      description: raw['description'] ? String(raw['description']) : null,
      language: raw['language'] ? String(raw['language']) : null,
      stargazersCount: Number(raw['stargazers_count'] ?? 0),
      htmlUrl: String(raw['html_url'] ?? `https://github.com/${fullName}`),
    },
  }
}
