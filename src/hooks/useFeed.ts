import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCollectiveFeed } from '../lib/collectiveFeed'
import { getCNCFCategory } from '../lib/cncfData'
import { cacheGet, cacheSet, feedCacheKey } from '../lib/cache'
import { useConfig } from './useConfig'
import type { CollectiveFeedState, CategoryFilter, FeedItem } from '../types/github'

const FEED_TTL_MS = 6 * 60 * 60 * 1000        // 6 hours
const COLLECTIVE_CACHE_KEY = feedCacheKey('collective')

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

  const fetchFeed = useCallback(async (token: string | undefined) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await fetchCollectiveFeed({ token })

      const next: CollectiveFeedState = {
        items: result.items,
        isLoading: false,
        isPartial: result.isPartial,
        failedUsers: result.failedUsers,
        fetchedAt: result.fetchedAt,
        error: null,
      }

      cacheSet(COLLECTIVE_CACHE_KEY, next)
      setState(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState(prev => ({ ...prev, isLoading: false, error: message }))
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const refresh = useCallback(() => {
    fetchFeed(config.token)
  }, [config.token, fetchFeed])

  useEffect(() => {
    const cached = cacheGet<CollectiveFeedState>(COLLECTIVE_CACHE_KEY, FEED_TTL_MS)

    if (cached) {
      // Serve from cache immediately; data is already a CollectiveFeedState snapshot
      setState({ ...cached.data, isLoading: false })
      // Background refresh not needed — cache is still within TTL
    } else {
      fetchFeed(config.token)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // run once on mount; refresh() is the explicit re-fetch path

  const filteredItems: FeedItem[] =
    categoryFilter === null
      ? state.items
      : state.items.filter(item => getCNCFCategory(item.repo.fullName) === categoryFilter)

  return { state, categoryFilter, setCategoryFilter, refresh, filteredItems }
}
