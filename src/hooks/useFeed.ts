import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCollectiveFeed } from '../lib/collectiveFeed'
import { getCNCFCategory } from '../lib/cncfData'
import { cacheGet, cacheSet, feedCacheKey } from '../lib/cache'
import { useConfig } from './useConfig'
import type { CollectiveFeedState, CategoryFilter, FeedItem } from '../types/github'

const FEED_TTL_MS = 6 * 60 * 60 * 1000        // 6 hours — max cache age before forced refresh
const STALE_MS = 60 * 60 * 1000               // 1 hour — trigger background refresh if older

function getCacheKey(token: string | undefined): string {
  return feedCacheKey(`collective:${token ? 'auth' : 'anon'}`)
}

const INITIAL_STATE: CollectiveFeedState = {
  items: [],
  isLoading: false,
  isPartial: false,
  failedUsers: [],
  fetchedAt: null,
  error: null,
}

export function useFeed(): {
  state: CollectiveFeedState
  categoryFilter: CategoryFilter
  setCategoryFilter: (cat: CategoryFilter) => void
  refresh: () => void
  filteredItems: FeedItem[]
} {
  const { config } = useConfig()
  const [state, setState] = useState<CollectiveFeedState>(INITIAL_STATE)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(null)
  const fetchingRef = useRef(false)

  const fetchFeed = useCallback(async (token: string | undefined, background = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    if (!background) {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    }

    try {
      const result = await fetchCollectiveFeed({ token })

      const next: CollectiveFeedState = {
        items: result.items,
        isLoading: false,
        isPartial: result.isPartial,
        failedUsers: result.failedUsers,
        fetchedAt: result.fetchedAt,
        error: result.rateLimited ? 'rate_limited' : null,
      }

      cacheSet(getCacheKey(token), next)
      setState(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (!background) {
        setState(prev => ({ ...prev, isLoading: false, error: message }))
      }
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const refresh = useCallback(() => {
    fetchFeed(config.token)
  }, [config.token, fetchFeed])

  useEffect(() => {
    const cacheKey = getCacheKey(config.token)
    const cached = cacheGet<CollectiveFeedState>(cacheKey, FEED_TTL_MS)

    if (cached) {
      setState({ ...cached.data, isLoading: false })
      // Background stale-while-revalidate: refresh if data is older than STALE_MS
      const ageMs = cached.ageMs
      if (ageMs > STALE_MS) {
        fetchFeed(config.token, /* background */ true)
      }
    } else {
      fetchFeed(config.token)
    }
  // Rerun when token changes so cache key and fetch target update accordingly
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.token])

  const filteredItems: FeedItem[] =
    categoryFilter === null
      ? state.items
      : state.items.filter(item => getCNCFCategory(item.repo.fullName) === categoryFilter)

  return { state, categoryFilter, setCategoryFilter, refresh, filteredItems }
}
