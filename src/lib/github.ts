import type { GitHubEvent, RepoMetadata, ApiResult } from '../types/github'

const GITHUB_API = 'https://api.github.com'
const FETCH_TIMEOUT_MS = 10_000

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

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
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
      response = await fetchWithTimeout(url, {
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

export async function getUserEvents(
  username: string,
  token?: string,
  page = 1,
): Promise<ApiResult<GitHubEvent[]>> {
  const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`

  const headers: HeadersInit = {
    ...getHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response: Response
  try {
    response = await fetchWithTimeout(url, { headers, redirect: 'error' })
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
    return { error: 'unknown', message: 'Failed to parse events JSON' }
  }

  return { data: events }
}

export async function getOrgMembers(
  org: string,
): Promise<ApiResult<string[]>> {
  const allMembers: string[] = []
  let page = 1

  while (true) {
    const url = `${GITHUB_API}/orgs/${encodeURIComponent(org)}/members?per_page=100&page=${page}`

    let response: Response
    try {
      response = await fetchWithTimeout(url, {
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

    let members: Array<{ login: string }>
    try {
      members = await response.json() as Array<{ login: string }>
    } catch {
      return { error: 'unknown', message: 'Failed to parse members JSON' }
    }

    allMembers.push(...members.map(m => m.login))

    if (members.length < 100) break
    page++
  }

  return { data: allMembers }
}

export async function getRepoMetadata(
  fullName: string
): Promise<ApiResult<RepoMetadata>> {
  const url = `${GITHUB_API}/repos/${fullName}`

  let response: Response
  try {
    response = await fetchWithTimeout(url, {
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
