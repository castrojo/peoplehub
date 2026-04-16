import { useState, useEffect, useCallback } from 'react'

type Theme = 'system' | 'light' | 'dark'

const THEME_KEY = 'peoplehub:theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
    } catch {
      // ignore
    }
    return 'system'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {
      // ignore
    }
    setThemeState(t)
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system')
  }, [theme, setTheme])

  return { theme, setTheme, cycleTheme }
}
