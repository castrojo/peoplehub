import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserEvents } from '../lib/github'
import { filterEvents, deduplicateEvents, aggregateEvents } from '../lib/events'
import { cacheGet, cacheSet } from '../lib/cache'
import { batchGetOrFetch } from '../lib/repoCache'
import type { FeedItem, FeedResult, RepoMetadata } from '../types/github'

const FEED_TTL_MS = 6 * 60 * 60 * 1000
const STALE_THRESHOLD_MS = 5 * 60 * 60 * 1000

type FeedStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'

interface UseTeamFeedResult {
  items: FeedItem[]
  repoMeta: Map<string, RepoMetadata>
  status: FeedStatus
  lastFetchedAt: Date | null
  isPartial: boolean
  refresh: () => void
}

function teamCacheKey(members: string[]): string {
  const sorted = [...members].sort()
  return `peoplehub:team-feed:v1:${sorted.join(',')}`
}

export function useTeamFeed(members: string[]): UseTeamFeedResult {
  const [items, setItems] = useState<FeedItem[]>([])
  const [repoMeta, setRepoMeta] = useState<Map<string, RepoMetadata>>(new Map())
  const [status, setStatus] = useState<FeedStatus>('idle')
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
  const [isPartial, setIsPartial] = useState(false)
  const fetchingRef = useRef(false)

  // Stable key to use as effect/callback dependency
  const membersKey = [...members].sort().join(',')

  const fetchFeed = useCallback(async (memberList: string[]) => {
    if (fetchingRef.current || memberList.length === 0) return
    fetchingRef.current = true
    setStatus('loading')

    // Fetch public events for all team members in parallel
    const results = await Promise.all(
      memberList.map(username => getUserEvents(username))
    )

    let anyRateLimited = false
    const allEvents: Parameters<typeof filterEvents>[0] = []

    for (const result of results) {
      if ('error' in result) {
        if (result.error === 'rate_limited') anyRateLimited = true
        continue
      }
      allEvents.push(...result.data)
    }

    // Surface rate-limit only if we got no events at all
    if (anyRateLimited && allEvents.length === 0) {
      fetchingRef.current = false
      setStatus('rate_limited')
      return
    }

    const filtered = filterEvents(allEvents)
    const deduped = deduplicateEvents(filtered)
    const feedResult: FeedResult = aggregateEvents(deduped)

    const repoNames = feedResult.items.map(i => i.repo.fullName)
    const meta = await batchGetOrFetch(repoNames)

    cacheSet(teamCacheKey(memberList), feedResult)

    setItems(feedResult.items)
    setRepoMeta(meta)
    setIsPartial(feedResult.isPartial)
    setLastFetchedAt(new Date(feedResult.fetchedAt))
    setStatus('success')
    fetchingRef.current = false
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    if (members.length > 0) fetchFeed(members)
  }, [membersKey, fetchFeed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (members.length === 0) {
      setStatus('idle')
      setItems([])
      return
    }

    const cached = cacheGet<FeedResult>(teamCacheKey(members), FEED_TTL_MS)

    if (cached) {
      setItems(cached.data.items)
      setIsPartial(cached.data.isPartial)
      setLastFetchedAt(new Date(cached.data.fetchedAt))
      setStatus('success')

      const repoNames = cached.data.items.map(i => i.repo.fullName)
      batchGetOrFetch(repoNames).then(setRepoMeta)

      if (cached.ageMs > STALE_THRESHOLD_MS) {
        fetchFeed(members)
      }
    } else {
      fetchFeed(members)
    }
  }, [membersKey, fetchFeed]) // eslint-disable-line react-hooks/exhaustive-deps

  return { items, repoMeta, status, lastFetchedAt, isPartial, refresh }
}
