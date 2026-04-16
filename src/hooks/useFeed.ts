import { useState, useEffect, useCallback, useRef } from 'react'
import { getReceivedEvents } from '../lib/github'
import { filterEvents, deduplicateEvents, aggregateEvents } from '../lib/events'
import { cacheGet, cacheSet, feedCacheKey } from '../lib/cache'
import { batchGetOrFetch } from '../lib/repoCache'
import type { FeedItem, FeedResult, RepoMetadata } from '../types/github'

const FEED_TTL_MS = 6 * 60 * 60 * 1000   // 6 hours
const STALE_THRESHOLD_MS = 5 * 60 * 60 * 1000 // background refresh at 5h

type FeedStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'

interface UseFeedResult {
  items: FeedItem[]
  repoMeta: Map<string, RepoMetadata>
  status: FeedStatus
  lastFetchedAt: Date | null
  isPartial: boolean
  refresh: () => void
}

export function useFeed(username: string | null): UseFeedResult {
  const [items, setItems] = useState<FeedItem[]>([])
  const [repoMeta, setRepoMeta] = useState<Map<string, RepoMetadata>>(new Map())
  const [status, setStatus] = useState<FeedStatus>('idle')
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
  const [isPartial, setIsPartial] = useState(false)
  const fetchingRef = useRef(false)

  const fetchFeed = useCallback(async (uname: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setStatus('loading')

    const result = await getReceivedEvents(uname)

    if ('error' in result) {
      fetchingRef.current = false
      if (result.error === 'rate_limited') {
        setStatus('rate_limited')
      } else {
        setStatus('error')
      }
      return
    }

    const filtered = filterEvents(result.data)
    const deduped = deduplicateEvents(filtered)
    const feedResult: FeedResult = aggregateEvents(deduped)

    // Batch-fetch repo metadata for all unique repos
    const repoNames = feedResult.items.map(i => i.repo.fullName)
    const meta = await batchGetOrFetch(repoNames)

    cacheSet(feedCacheKey(uname), feedResult)

    setItems(feedResult.items)
    setRepoMeta(meta)
    setIsPartial(feedResult.isPartial)
    setLastFetchedAt(new Date(feedResult.fetchedAt))
    setStatus('success')
    fetchingRef.current = false
  }, [])

  const refresh = useCallback(() => {
    if (username) fetchFeed(username)
  }, [username, fetchFeed])

  useEffect(() => {
    if (!username) {
      setStatus('idle')
      setItems([])
      return
    }

    const cached = cacheGet<FeedResult>(feedCacheKey(username), FEED_TTL_MS)

    if (cached) {
      // Serve from cache immediately
      setItems(cached.data.items)
      setIsPartial(cached.data.isPartial)
      setLastFetchedAt(new Date(cached.data.fetchedAt))
      setStatus('success')

      // Enrich repo metadata from repoCache (may be cached already)
      const repoNames = cached.data.items.map(i => i.repo.fullName)
      batchGetOrFetch(repoNames).then(setRepoMeta)

      // Background refresh if getting stale
      if (cached.ageMs > STALE_THRESHOLD_MS) {
        fetchFeed(username)
      }
    } else {
      fetchFeed(username)
    }
  }, [username, fetchFeed])

  return { items, repoMeta, status, lastFetchedAt, isPartial, refresh }
}
