import { useState, useCallback } from 'react'

const TEAM_KEY = 'peoplehub:team'

export function useTeamMembers() {
  const [members, setMembersState] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(TEAM_KEY)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  const setMembers = useCallback((newMembers: string[]) => {
    try {
      localStorage.setItem(TEAM_KEY, JSON.stringify(newMembers))
    } catch {
      // storage unavailable — still update state
    }
    setMembersState(newMembers)
  }, [])

  const clearMembers = useCallback(() => {
    try {
      localStorage.removeItem(TEAM_KEY)
    } catch {
      // ignore
    }
    setMembersState([])
  }, [])

  return { members, setMembers, clearMembers }
}
