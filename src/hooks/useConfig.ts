import { useState, useCallback } from 'react'
import type { AppConfig } from '../types/config'
import { CONFIG_KEY } from '../types/config'

const TOKEN_SESSION_KEY = `${CONFIG_KEY}:token`

function readToken(): string | undefined {
  try {
    return sessionStorage.getItem(TOKEN_SESSION_KEY) ?? undefined
  } catch {
    return undefined
  }
}

function writeToken(token: string | undefined): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_SESSION_KEY, token)
    } else {
      sessionStorage.removeItem(TOKEN_SESSION_KEY)
    }
  } catch {
    // ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

export function useConfig(): {
  config: AppConfig
  setToken: (token: string) => void
  clearToken: () => void
  isConfigured: boolean
} {
  const [config, setConfigState] = useState<AppConfig>(() => ({
    token: readToken(),
  }))

  const setToken = useCallback((token: string) => {
    setConfigState(prev => {
      const next: AppConfig = { ...prev, token: token || undefined }
      writeToken(next.token)
      return next
    })
  }, [])

  const clearToken = useCallback(() => {
    setConfigState(prev => {
      const next: AppConfig = { ...prev }
      delete next.token
      writeToken(undefined)
      return next
    })
  }, [])

  // Token is optional — the feed works without one, just rate-limited
  const isConfigured = true

  return { config, setToken, clearToken, isConfigured }
}
