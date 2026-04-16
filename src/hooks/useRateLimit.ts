import { useState, useCallback } from 'react'

interface RateLimitState {
  isRateLimited: boolean
  retryAfter: number | null
}

export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: null,
  })

  const setRateLimited = useCallback((retryAfter: number) => {
    setState({ isRateLimited: true, retryAfter })
  }, [])

  const clear = useCallback(() => {
    setState({ isRateLimited: false, retryAfter: null })
  }, [])

  return { ...state, setRateLimited, clear }
}
