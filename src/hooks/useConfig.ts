import { useState, useCallback } from 'react'
import type { AppConfig } from '../types/config'
import { CONFIG_KEY } from '../types/config'

function readConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return JSON.parse(raw) as AppConfig
  } catch {
    // ignore parse errors — return empty config
  }
  return {}
}

function writeConfig(config: AppConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
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
  const [config, setConfigState] = useState<AppConfig>(() => readConfig())

  const setToken = useCallback((token: string) => {
    setConfigState(prev => {
      const next: AppConfig = { ...prev, token }
      writeConfig(next)
      return next
    })
  }, [])

  const clearToken = useCallback(() => {
    setConfigState(prev => {
      const next: AppConfig = { ...prev }
      delete next.token
      writeConfig(next)
      return next
    })
  }, [])

  // Token is optional — the feed works without one, just rate-limited
  const isConfigured = true

  return { config, setToken, clearToken, isConfigured }
}
