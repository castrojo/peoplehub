import { useState, useEffect, useMemo } from 'react'
import { useFeed } from '../hooks/useFeed'
import { useRateLimit } from '../hooks/useRateLimit'
import { useTheme } from '../hooks/useTheme'
import { useKeyboardNav } from '../hooks/useKeyboardNav'
import { FeedList } from '../components/FeedList'
import { RateLimitBanner } from '../components/RateLimitBanner'
import { CategoryNav } from '../components/CategoryNav'
import { ToolOfTheDay } from '../components/ToolOfTheDay'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ShortcutsHelp } from '../components/ShortcutsHelp'
import { CNCF_PROJECTS } from '../lib/cncfData'
import type { RepoMetadata } from '../types/github'

interface FeedPageProps {
  onGoToSetup?: () => void
}

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <>🌙</>
  if (theme === 'light') return <>☀️</>
  return <>💻</>
}

// Build metadata map from CNCF catalog so descriptions appear for known projects
function buildCNCFRepoMeta(): Map<string, RepoMetadata> {
  const map = new Map<string, RepoMetadata>()
  for (const project of CNCF_PROJECTS) {
    map.set(project.repo.toLowerCase(), {
      fullName: project.repo,
      description: `CNCF ${project.maturity} project · ${project.category}`,
      language: null,
      stargazersCount: 0,
      htmlUrl: project.homepage,
    })
  }
  return map
}

export function FeedPage({ onGoToSetup }: FeedPageProps) {
  const { state, categoryFilter, setCategoryFilter, refresh, filteredItems } = useFeed()
  const { isRateLimited, retryAfter, setRateLimited, clear: clearRateLimit } = useRateLimit()
  const { theme, cycleTheme } = useTheme()
  const [failedDismissed, setFailedDismissed] = useState(false)

  const cncfRepoMeta = useMemo(() => buildCNCFRepoMeta(), [])

  // Derive a status string compatible with FeedList
  const status = state.isLoading
    ? 'loading'
    : state.error === 'rate_limited'
    ? 'rate_limited'
    : state.error
    ? 'error'
    : state.fetchedAt
    ? 'success'
    : 'idle'

  // Sync rate limit state from derived status (in effect, not render)
  useEffect(() => {
    if (status === 'rate_limited' && !isRateLimited) {
      setRateLimited(60_000)
    }
  }, [status, isRateLimited, setRateLimited])

  // Reset dismissed banner when failed users list changes
  useEffect(() => {
    setFailedDismissed(false)
  }, [state.failedUsers])

  const { selectedIndex, showHelp, setShowHelp } = useKeyboardNav({
    itemCount: filteredItems.length,
    onOpen: (index) => {
      const item = filteredItems[index]
      if (item?.repo.htmlUrl.startsWith('https://github.com/')) {
        window.open(item.repo.htmlUrl, '_blank', 'noopener,noreferrer')
      }
    },
    onRefresh: refresh,
  })

  const showFailedBanner =
    !failedDismissed && state.failedUsers.length > 0 && !state.isLoading

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border sticky top-0 bg-canvas z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-fg leading-tight">awesome-cncf ✨</h1>
            <p className="text-xs text-fg-muted leading-tight">
              what the CNCF community is building
              {' '}
              <span className="text-fg-subtle">#puertorico-allhands-2027</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {state.fetchedAt && (
              <span className="hidden sm:block text-xs text-fg-subtle">
                Updated {new Date(state.fetchedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={state.isLoading}
              className="text-xs text-fg-muted hover:text-fg disabled:opacity-40"
              title="Refresh (r)"
            >
              ↻
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="text-xs text-fg-muted hover:text-fg"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>
            <button
              onClick={cycleTheme}
              className="text-sm"
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon theme={theme} />
            </button>
            {onGoToSetup && (
              <button
                onClick={onGoToSetup}
                className="text-xs text-fg-muted hover:text-fg"
              >
                Settings
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isRateLimited && (
          <RateLimitBanner retryAfter={retryAfter} onDismiss={clearRateLimit} />
        )}

        {showFailedBanner && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-canvas-subtle px-4 py-2 text-sm">
            <span className="text-fg-muted">
              ⚠️ Could not reach {state.failedUsers.length} community member{state.failedUsers.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setFailedDismissed(true)}
              aria-label="Dismiss"
              className="text-fg-subtle hover:text-fg text-lg leading-none shrink-0"
            >
              ×
            </button>
          </div>
        )}

        <ToolOfTheDay />

        <div className="mb-4">
          <CategoryNav active={categoryFilter} onChange={setCategoryFilter} />
        </div>

        <ErrorBoundary>
          <FeedList
            items={filteredItems}
            repoMeta={cncfRepoMeta}
            status={status as 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'}
            isPartial={state.isPartial}
            selectedIndex={selectedIndex}
            onRetry={refresh}
          />
        </ErrorBoundary>

        {filteredItems.length > 0 && (
          <p className="mt-6 text-center text-xs text-fg-subtle">
            <kbd className="font-mono">j</kbd>/<kbd className="font-mono">k</kbd> navigate
            {' · '}
            <kbd className="font-mono">l</kbd> open
            {' · '}
            <kbd className="font-mono">r</kbd> refresh
            {' · '}
            <button onClick={() => setShowHelp(true)} className="underline hover:text-fg">
              ?
            </button>
          </p>
        )}
      </main>

      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}
    </div>
  )
}
