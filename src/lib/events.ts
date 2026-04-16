import type { GitHubEvent, FeedItem, FeedResult } from '../types/github'

export function filterEvents(events: GitHubEvent[]): GitHubEvent[] {
  return events.filter(
    e => e.type === 'WatchEvent' || e.type === 'ForkEvent'
  )
}

export function deduplicateEvents(events: GitHubEvent[]): GitHubEvent[] {
  const seen = new Set<string>()
  return events.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })
}

function utcDateBucket(isoString: string): string {
  // Always use UTC date to avoid timezone-based mis-grouping
  return isoString.slice(0, 10)
}

function repoHtmlUrl(event: GitHubEvent): string {
  return `https://github.com/${event.repo.name}`
}

export function aggregateEvents(events: GitHubEvent[]): FeedResult {
  type GroupKey = string
  const groups = new Map<GroupKey, {
    type: 'star' | 'fork'
    repoFullName: string
    repoApiUrl: string
    repoHtmlUrl: string
    actorMap: Map<string, { login: string; avatarUrl: string; profileUrl: string }>
    latestAt: string
  }>()

  for (const event of events) {
    const eventType = event.type === 'WatchEvent' ? 'star' : 'fork'
    const bucket = utcDateBucket(event.created_at)
    const key: GroupKey = `${event.repo.name}:${bucket}:${eventType}`

    let group = groups.get(key)
    if (!group) {
      group = {
        type: eventType,
        repoFullName: event.repo.name,
        repoApiUrl: event.repo.url,
        repoHtmlUrl: repoHtmlUrl(event),
        actorMap: new Map(),
        latestAt: event.created_at,
      }
      groups.set(key, group)
    }

    group.actorMap.set(event.actor.login, {
      login: event.actor.login,
      avatarUrl: event.actor.avatar_url,
      profileUrl: `https://github.com/${event.actor.login}`,
    })

    if (event.created_at > group.latestAt) {
      group.latestAt = event.created_at
    }
  }

  const items: FeedItem[] = Array.from(groups.entries()).map(([key, group]) => ({
    id: key,
    type: group.type,
    repo: {
      fullName: group.repoFullName,
      apiUrl: group.repoApiUrl,
      htmlUrl: group.repoHtmlUrl,
    },
    actors: Array.from(group.actorMap.values()),
    count: group.actorMap.size,
    latestAt: group.latestAt,
  }))

  // Sort by most recent first
  items.sort((a, b) => b.latestAt.localeCompare(a.latestAt))

  const isPartial = events.length > 0 && events.length % 100 === 0

  return {
    items,
    isPartial,
    fetchedAt: new Date().toISOString(),
  }
}
