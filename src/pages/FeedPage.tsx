import { useNavigate } from 'react-router-dom'
import { useFeed } from '../hooks/useFeed'
import { useRateLimit } from '../hooks/useRateLimit'
import { useTheme } from '../hooks/useTheme'
import { FeedList } from '../components/FeedList'
import { RateLimitBanner } from '../components/RateLimitBanner'
import { ErrorBoundary } from '../components/ErrorBoundary'

interface FeedPageProps {
  username: string
  onChangeUsername: () => void
}

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <>🌙</>
  if (theme === 'light') return <>☀️</>
  return <>💻</>
}

export function FeedPage({ username, onChangeUsername }: FeedPageProps) {
  const { items, repoMeta, status, lastFetchedAt, isPartial, refresh } = useFeed(username)
  const { isRateLimited, retryAfter, setRateLimited, clear: clearRateLimit } = useRateLimit()
  const { theme, cycleTheme } = useTheme()
  const navigate = useNavigate()

  // Sync rate limit state from feed status
  if (status === 'rate_limited' && !isRateLimited) {
    setRateLimited(60_000)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border sticky top-0 bg-canvas z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-fg">peoplehub</h1>
            <span className="text-xs text-fg-subtle">@{username}</span>
          </div>
          <div className="flex items-center gap-3">
            {lastFetchedAt && (
              <span className="hidden sm:block text-xs text-fg-subtle">
                Updated {lastFetchedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={status === 'loading'}
              className="text-xs text-fg-muted hover:text-fg disabled:opacity-40"
            >
              ↻
            </button>
            <button
              onClick={cycleTheme}
              className="text-sm"
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon theme={theme} />
            </button>
            <button
              onClick={() => {
                onChangeUsername()
                navigate('/setup')
              }}
              className="text-xs text-fg-muted hover:text-fg"
            >
              Change user
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isRateLimited && (
          <RateLimitBanner retryAfter={retryAfter} onDismiss={clearRateLimit} />
        )}
        <ErrorBoundary>
          <FeedList
            items={items}
            repoMeta={repoMeta}
            status={status}
            isPartial={isPartial}
            onRetry={refresh}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}
