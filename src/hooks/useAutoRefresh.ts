import { useState, useEffect, useRef, useCallback } from 'react'

export const AUTO_REFRESH_INTERVALS = [
  { label: '2 min', ms: 2 * 60 * 1000 },
  { label: '5 min', ms: 5 * 60 * 1000 },
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
] as const

export type AutoRefreshInterval = typeof AUTO_REFRESH_INTERVALS[number]['ms']

const DEFAULT_INTERVAL_MS: AutoRefreshInterval = 5 * 60 * 1000

interface UseAutoRefreshOptions {
  onRefresh: () => void
}

interface UseAutoRefreshResult {
  isLive: boolean
  intervalMs: AutoRefreshInterval
  nextRefreshIn: number | null  // seconds until next refresh
  toggleLive: () => void
  setIntervalMs: (ms: AutoRefreshInterval) => void
}

export function useAutoRefresh({ onRefresh }: UseAutoRefreshOptions): UseAutoRefreshResult {
  const [isLive, setIsLive] = useState(false)
  const [intervalMs, setIntervalMsState] = useState<AutoRefreshInterval>(DEFAULT_INTERVAL_MS)
  const [nextRefreshIn, setNextRefreshIn] = useState<number | null>(null)

  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Acquire / release Wake Lock when live mode changes
  useEffect(() => {
    if (!isLive) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
      return
    }

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLockRef.current = lock
        // Re-acquire if the lock is released by the browser (e.g. tab hidden)
        lock.addEventListener('release', () => {
          if (isLive && 'wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then(newLock => {
              wakeLockRef.current = newLock
            }).catch(() => {})
          }
        })
      }).catch(() => {
        // Wake Lock not granted (e.g. not in secure context) — silently ignore
      })
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [isLive])

  // Countdown + auto-refresh interval
  useEffect(() => {
    if (!isLive) {
      setNextRefreshIn(null)
      return
    }

    const startedAt = Date.now()
    const deadline = startedAt + intervalMs

    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setNextRefreshIn(remaining)
      if (remaining === 0) {
        onRefreshRef.current()
      }
    }, 1000)

    // Trigger the first countdown value immediately
    setNextRefreshIn(Math.ceil(intervalMs / 1000))

    return () => clearInterval(tick)
  }, [isLive, intervalMs])

  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev)
  }, [])

  const setIntervalMs = useCallback((ms: AutoRefreshInterval) => {
    setIntervalMsState(ms)
  }, [])

  return { isLive, intervalMs, nextRefreshIn, toggleLive, setIntervalMs }
}
