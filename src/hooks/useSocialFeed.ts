import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchSocialFeed, SOCIAL_HASHTAG } from '../lib/socialFeed'
import { cacheGet, cacheSet, socialFeedCacheKey } from '../lib/cache'
import type { SocialFeedState } from '../types/social'

const FEED_TTL_MS = 15 * 60 * 1000  // 15 minutes — social posts move faster than stars
const STALE_MS = 5 * 60 * 1000      // 5 minutes — trigger background refresh if older

const INITIAL_STATE: SocialFeedState = {
  posts: [],
  isLoading: false,
  failedSources: [],
  fetchedAt: null,
  error: null,
}

export function useSocialFeed(tag: string = SOCIAL_HASHTAG) {
  const [state, setState] = useState<SocialFeedState>(INITIAL_STATE)
  const fetchingRef = useRef(false)

  const load = useCallback(async (background = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    if (!background) {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    }

    try {
      const result = await fetchSocialFeed(tag)
      const next: SocialFeedState = {
        posts: result.posts,
        isLoading: false,
        failedSources: result.failedSources,
        fetchedAt: result.fetchedAt,
        error: result.posts.length === 0 && result.failedSources.length > 0 ? 'all_sources_failed' : null,
      }
      cacheSet(socialFeedCacheKey(tag), next)
      setState(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (!background) {
        setState(prev => ({ ...prev, isLoading: false, error: message }))
      }
    } finally {
      fetchingRef.current = false
    }
  }, [tag])

  const refresh = useCallback(() => load(), [load])

  useEffect(() => {
    const cacheKey = socialFeedCacheKey(tag)
    const cached = cacheGet<SocialFeedState>(cacheKey, FEED_TTL_MS)

    if (cached) {
      setState({ ...cached.data, isLoading: false })
      if (cached.ageMs > STALE_MS) {
        load(/* background */ true)
      }
    } else {
      load()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag])

  return { state, refresh }
}
