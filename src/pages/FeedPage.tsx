import { useNavigate } from 'react-router-dom'
import { useFeed } from '../hooks/useFeed'
import { useTeamFeed } from '../hooks/useTeamFeed'
import { useRateLimit } from '../hooks/useRateLimit'
import { useTheme } from '../hooks/useTheme'
import { useKeyboardNav } from '../hooks/useKeyboardNav'
import { useAutoRefresh, AUTO_REFRESH_INTERVALS, type AutoRefreshInterval } from '../hooks/useAutoRefresh'
import { FeedList } from '../components/FeedList'
import { RateLimitBanner } from '../components/RateLimitBanner'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ShortcutsHelp } from '../components/ShortcutsHelp'
import type { FeedItem, RepoMetadata } from '../types/github'

// ── prop shapes ──────────────────────────────────────────────────────────────

interface PersonalFeedPageProps {
  username: string
  teamMembers?: never
  onChangeSetup: () => void
}

interface TeamFeedPageProps {
  teamMembers: string[]
  username?: never
  onChangeSetup: () => void
}

type FeedPageProps = PersonalFeedPageProps | TeamFeedPageProps

// ── helpers ──────────────────────────────────────────────────────────────────

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <>🌙</>
  if (theme === 'light') return <>☀️</>
  return <>💻</>
}

function formatCountdown(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

// ── inner component that receives resolved feed data ─────────────────────────

interface FeedViewProps {
  items: FeedItem[]
  repoMeta: Map<string, RepoMetadata>
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'
  lastFetchedAt: Date | null
  isPartial: boolean
  refresh: () => void
  label: string          // e.g. "@castrojo" or "Team · 12 members"
  onChangeSetup: () => void
}

function FeedView({
  items, repoMeta, status, lastFetchedAt, isPartial, refresh,
  label, onChangeSetup,
}: FeedViewProps) {
  const { isRateLimited, retryAfter, setRateLimited, clear: clearRateLimit } = useRateLimit()
  const { theme, cycleTheme } = useTheme()
  const navigate = useNavigate()

  const { selectedIndex, showHelp, setShowHelp } = useKeyboardNav({
    itemCount: items.length,
    onOpen: (index) => {
      const item = items[index]
      if (item?.repo.htmlUrl.startsWith('https://github.com/')) {
        window.open(item.repo.htmlUrl, '_blank', 'noopener,noreferrer')
      }
    },
    onRefresh: refresh,
  })

  const { isLive, intervalMs, nextRefreshIn, toggleLive, setIntervalMs } = useAutoRefresh({
    onRefresh: refresh,
  })

  if (status === 'rate_limited' && !isRateLimited) {
    setRateLimited(60_000)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border sticky top-0 bg-canvas z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-fg">peoplehub</h1>
            <span className="text-xs text-fg-subtle">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            {lastFetchedAt && (
              <span className="hidden sm:block text-xs text-fg-subtle">
                Updated {lastFetchedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {/* Live / auto-refresh controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLive}
                title={isLive ? 'Disable auto-refresh' : 'Enable auto-refresh (ambient display)'}
                className={[
                  'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
                  isLive
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'text-fg-muted hover:text-fg',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block w-1.5 h-1.5 rounded-full',
                    isLive ? 'bg-green-500 animate-pulse' : 'bg-fg-subtle',
                  ].join(' ')}
                />
                {isLive ? 'LIVE' : 'LIVE'}
              </button>
              {isLive && nextRefreshIn !== null && (
                <span className="text-xs text-fg-subtle tabular-nums">
                  {formatCountdown(nextRefreshIn)}
                </span>
              )}
              {isLive && (
                <select
                  value={intervalMs}
                  onChange={e => setIntervalMs(Number(e.target.value) as AutoRefreshInterval)}
                  className="text-xs text-fg-muted bg-transparent border-none outline-none cursor-pointer"
                  title="Auto-refresh interval"
                >
                  {AUTO_REFRESH_INTERVALS.map(opt => (
                    <option key={opt.ms} value={opt.ms}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={refresh}
              disabled={status === 'loading'}
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
            <button
              onClick={() => {
                onChangeSetup()
                navigate('/setup')
              }}
              className="text-xs text-fg-muted hover:text-fg"
            >
              Change
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
            selectedIndex={selectedIndex}
            onRetry={refresh}
          />
        </ErrorBoundary>
        {items.length > 0 && (
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

// ── personal feed wrapper ─────────────────────────────────────────────────────

function PersonalFeedPage({ username, onChangeSetup }: { username: string; onChangeSetup: () => void }) {
  const { items, repoMeta, status, lastFetchedAt, isPartial, refresh } = useFeed(username)
  return (
    <FeedView
      items={items}
      repoMeta={repoMeta}
      status={status}
      lastFetchedAt={lastFetchedAt}
      isPartial={isPartial}
      refresh={refresh}
      label={`@${username}`}
      onChangeSetup={onChangeSetup}
    />
  )
}

// ── team feed wrapper ─────────────────────────────────────────────────────────

function TeamFeedPage({ teamMembers, onChangeSetup }: { teamMembers: string[]; onChangeSetup: () => void }) {
  const { items, repoMeta, status, lastFetchedAt, isPartial, refresh } = useTeamFeed(teamMembers)
  const label = `Team · ${teamMembers.length} member${teamMembers.length === 1 ? '' : 's'}`
  return (
    <FeedView
      items={items}
      repoMeta={repoMeta}
      status={status}
      lastFetchedAt={lastFetchedAt}
      isPartial={isPartial}
      refresh={refresh}
      label={label}
      onChangeSetup={onChangeSetup}
    />
  )
}

// ── public export ─────────────────────────────────────────────────────────────

export function FeedPage({ username, teamMembers, onChangeSetup }: FeedPageProps) {
  if (teamMembers && teamMembers.length > 0) {
    return <TeamFeedPage teamMembers={teamMembers} onChangeSetup={onChangeSetup} />
  }
  if (username) {
    return <PersonalFeedPage username={username} onChangeSetup={onChangeSetup} />
  }
  return null
}

