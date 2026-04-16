import { useState, useEffect, useCallback } from 'react'

interface UseKeyboardNavOptions {
  itemCount: number
  onOpen: (index: number) => void
  onRefresh: () => void
}

export function useKeyboardNav({ itemCount, onOpen, onRefresh }: UseKeyboardNavOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const scrollToIndex = useCallback((index: number) => {
    const el = document.querySelector<HTMLElement>(`[data-feed-index="${index}"]`)
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      el.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (itemCount === 0) return

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case 'j':
        case 'ArrowDown': {
          e.preventDefault()
          setSelectedIndex(prev => {
            const next = prev === null ? 0 : Math.min(prev + 1, itemCount - 1)
            scrollToIndex(next)
            return next
          })
          break
        }
        case 'k':
        case 'ArrowUp': {
          e.preventDefault()
          setSelectedIndex(prev => {
            const next = prev === null ? 0 : Math.max(prev - 1, 0)
            scrollToIndex(next)
            return next
          })
          break
        }
        case 'l':
        case 'Enter': {
          if (selectedIndex !== null) {
            e.preventDefault()
            onOpen(selectedIndex)
          }
          break
        }
        case 'h': {
          e.preventDefault()
          setSelectedIndex(0)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          scrollToIndex(0)
          break
        }
        case 'r': {
          e.preventDefault()
          onRefresh()
          break
        }
        case '?': {
          e.preventDefault()
          setShowHelp(prev => !prev)
          break
        }
        case 'Escape': {
          setShowHelp(false)
          setSelectedIndex(null)
          break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [itemCount, selectedIndex, onOpen, onRefresh, scrollToIndex])

  // Reset selection when items change (e.g. refresh)
  useEffect(() => {
    setSelectedIndex(null)
  }, [itemCount])

  return { selectedIndex, showHelp, setShowHelp }
}
