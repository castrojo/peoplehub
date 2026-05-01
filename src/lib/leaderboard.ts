import type { FeedItem } from '../types/github'

export interface LeaderboardEntry {
  repo: {
    fullName: string
    htmlUrl: string
  }
  starCount: number   // unique people who starred it in this feed window
  forkCount: number   // unique people who forked it in this feed window
  totalActivity: number
  latestAt: string
}

/**
 * Aggregate all feed items by repo and sort by total activity (stars + forks).
 */
export function computeLeaderboard(items: FeedItem[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>()

  for (const item of items) {
    const key = item.repo.fullName
    let entry = map.get(key)
    if (!entry) {
      entry = {
        repo: { fullName: item.repo.fullName, htmlUrl: item.repo.htmlUrl },
        starCount: 0,
        forkCount: 0,
        totalActivity: 0,
        latestAt: item.latestAt,
      }
      map.set(key, entry)
    }

    if (item.type === 'star') entry.starCount += item.count
    else entry.forkCount += item.count
    entry.totalActivity += item.count

    if (item.latestAt > entry.latestAt) entry.latestAt = item.latestAt
  }

  return Array.from(map.values()).sort((a, b) => b.totalActivity - a.totalActivity)
}

/**
 * Same as computeLeaderboard but restricted to items within the last `windowDays` days.
 */
export function computeTrending(items: FeedItem[], windowDays = 7): LeaderboardEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const cutoffIso = cutoff.toISOString()
  return computeLeaderboard(items.filter(item => item.latestAt >= cutoffIso))
}
