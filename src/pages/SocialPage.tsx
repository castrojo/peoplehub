import { useNavigate } from 'react-router-dom'
import { useSocialFeed } from '../hooks/useSocialFeed'
import { useTheme } from '../hooks/useTheme'
import { SocialFeedList } from '../components/SocialFeedList'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SOCIAL_HASHTAG } from '../lib/socialFeed'

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <>🌙</>
  if (theme === 'light') return <>☀️</>
  return <>💻</>
}

export function SocialPage() {
  const { state, refresh } = useSocialFeed()
  const { theme, cycleTheme } = useTheme()
  const navigate = useNavigate()

  const status = state.isLoading
    ? 'loading'
    : state.error
    ? 'error'
    : 'success'

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border sticky top-0 bg-canvas z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-fg leading-tight">Social feed</h1>
            <p className="text-xs text-fg-muted leading-tight">
              posts tagged <span className="text-fg-subtle">#{SOCIAL_HASHTAG}</span> from Mastodon &amp; Bluesky
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
              title="Refresh"
            >
              ↻
            </button>
            <button onClick={cycleTheme} className="text-sm" aria-label={`Theme: ${theme}`}>
              <ThemeIcon theme={theme} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-fg-muted hover:text-fg"
            >
              ← Feed
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4 rounded-lg border border-border bg-canvas-subtle px-4 py-3 text-sm text-fg-muted">
          Post about a CNCF tool or project with{' '}
          <code className="text-xs bg-canvas px-1 py-0.5 rounded border border-border">#{SOCIAL_HASHTAG}</code>{' '}
          on Mastodon or Bluesky to share why you like it — it'll show up here.
        </div>

        <ErrorBoundary>
          <SocialFeedList
            posts={state.posts}
            status={status}
            failedSources={state.failedSources}
            onRetry={refresh}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}
