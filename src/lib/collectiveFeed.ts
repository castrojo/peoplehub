import { SEED_USERS } from './seedUsers'
import { getUserEvents } from './github'
import { filterEvents, deduplicateEvents, aggregateEvents } from './events'
import type { GitHubEvent, FeedResult } from '../types/github'

export interface CollectiveFeedOptions {
  token?: string
  /** How many pages to fetch per user. Defaults to 1 (no token) or 2 (with token). */
  pagesPerUser?: number
}

export interface CollectiveFeedResult extends FeedResult {
  failedUsers: string[]
}

const BATCH_SIZE = 5

async function fetchUserEvents(
  username: string,
  token: string | undefined,
  pages: number,
): Promise<{ username: string; events: GitHubEvent[] } | { username: string; failed: true }> {
  const allEvents: GitHubEvent[] = []

  for (let page = 1; page <= pages; page++) {
    const result = await getUserEvents(username, token, page)

    if ('error' in result) {
      // Any error for this user: skip them entirely
      return { username, failed: true }
    }

    allEvents.push(...result.data)

    // Stop paginating early if the page wasn't full
    if (result.data.length < 100) break
  }

  return { username, events: allEvents }
}

export async function fetchCollectiveFeed(
  options: CollectiveFeedOptions = {},
): Promise<CollectiveFeedResult> {
  const { token } = options
  const pagesPerUser = options.pagesPerUser ?? (token ? 2 : 1)

  const users = [...SEED_USERS]
  const allEvents: GitHubEvent[] = []
  const failedUsers: string[] = []

  // Process users in bounded batches of BATCH_SIZE to avoid secondary rate limiting
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.all(
      batch.map(username => fetchUserEvents(username, token, pagesPerUser)),
    )

    for (const result of batchResults) {
      if ('failed' in result) {
        failedUsers.push(result.username)
      } else {
        allEvents.push(...result.events)
      }
    }
  }

  const filtered = filterEvents(allEvents)
  const deduplicated = deduplicateEvents(filtered)
  const feedResult = aggregateEvents(deduplicated)

  return {
    ...feedResult,
    failedUsers,
  }
}
