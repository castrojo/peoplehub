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
  rateLimited: boolean
}

const BATCH_SIZE = 5

async function fetchUserEvents(
  username: string,
  token: string | undefined,
  pages: number,
): Promise<{ username: string; events: GitHubEvent[]; rateLimited?: boolean } | { username: string; failed: true; rateLimited?: boolean }> {
  const allEvents: GitHubEvent[] = []

  for (let page = 1; page <= pages; page++) {
    const result = await getUserEvents(username, token, page)

    if ('error' in result) {
      if (result.error === 'rate_limited') {
        // Return whatever we accumulated so far with rate-limited flag
        if (allEvents.length > 0) {
          return { username, events: allEvents, rateLimited: true }
        }
        return { username, failed: true, rateLimited: true }
      }
      // For other errors: return partial events if we have them, otherwise fail
      if (allEvents.length > 0) {
        return { username, events: allEvents }
      }
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
  let rateLimited = false

  // Process users in bounded batches of BATCH_SIZE to avoid secondary rate limiting
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map(username => fetchUserEvents(username, token, pagesPerUser)),
    )

    for (const settled of batchResults) {
      if (settled.status === 'rejected') {
        // fetchUserEvents itself threw — shouldn't happen but handle defensively
        continue
      }
      const result = settled.value
      if (result.rateLimited) {
        rateLimited = true
      }
      if ('failed' in result) {
        failedUsers.push(result.username)
      } else {
        allEvents.push(...result.events)
      }
    }

    // If rate limited, stop processing further batches
    if (rateLimited) break
  }

  const filtered = filterEvents(allEvents)
  const deduplicated = deduplicateEvents(filtered)
  const feedResult = aggregateEvents(deduplicated)

  return {
    ...feedResult,
    failedUsers,
    rateLimited,
  }
}
