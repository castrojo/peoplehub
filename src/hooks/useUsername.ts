import { useState, useCallback } from 'react'

const USERNAME_KEY = 'peoplehub:username'

export function useUsername() {
  const [username, setUsernameState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(USERNAME_KEY)
    } catch {
      return null
    }
  })

  const setUsername = useCallback((name: string) => {
    try {
      localStorage.setItem(USERNAME_KEY, name)
    } catch {
      // storage unavailable — still update state
    }
    setUsernameState(name)
  }, [])

  const clearUsername = useCallback(() => {
    try {
      localStorage.removeItem(USERNAME_KEY)
    } catch {
      // ignore
    }
    setUsernameState(null)
  }, [])

  return { username, setUsername, clearUsername }
}
