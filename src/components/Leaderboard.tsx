import { useState, useMemo } from 'react'
import { computeLeaderboard, computeTrending } from '../lib/leaderboard'
import type { FeedItem, RepoMetadata } from '../types/github'

interface LeaderboardProps {
  items: FeedItem[]
  repoMeta: Map<string, RepoMetadata>
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'
}

type LeaderboardTab = 'top' | 'trending'

const TRENDING_WINDOWS = [
  { label: '24 h', days: 1 },
  { label: '7 d',  days: 7 },
  { label: '30 d', days: 30 },
] as const

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span title="1st">🥇</span>
  if (rank === 2) return <span title="2nd">🥈</span>
  if (rank === 3) return <span title="3rd">🥉</span>
  return <span className="text-xs text-fg-subtle tabular-nums w-5 text-right">{rank}</span>
}

export function Leaderboard({ items, repoMeta, status }: LeaderboardProps) {
  const [tab, setTab] = useState<LeaderboardTab>('top')
  const [trendingDays, setTrendingDays] = useState(7)

  const topEntries = useMemo(() => computeLeaderboard(items), [items])
  const trendingEntries = useMemo(
    () => computeTrending(items, trendingDays),
    [items, trendingDays],
  )

  const entries = tab === 'top' ? topEntries : trendingEntries

  if (status === 'loading') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-canvas border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-canvas-subtle" />
              <div className="h-3 w-48 rounded bg-canvas-subtle" />
            </div>
            <div className="mt-2 h-3 w-full rounded bg-canvas-subtle" />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'success' && entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-fg-muted">No data yet.</p>
        <p className="text-fg-subtle text-sm mt-1">
          {tab === 'trending'
            ? `No activity in the last ${trendingDays} day${trendingDays === 1 ? '' : 's'}.`
            : 'Load a feed to see top projects.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-md border border-border overflow-hidden text-sm">
          <button
            onClick={() => setTab('top')}
            className={[
              'px-3 py-1.5 font-medium transition-colors',
              tab === 'top'
                ? 'bg-accent-emphasis text-white'
                : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            🏆 Top projects
          </button>
          <button
            onClick={() => setTab('trending')}
            className={[
              'px-3 py-1.5 font-medium border-l border-border transition-colors',
              tab === 'trending'
                ? 'bg-accent-emphasis text-white'
                : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            🔥 Trending
          </button>
        </div>

        {tab === 'trending' && (
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            {TRENDING_WINDOWS.map(w => (
              <button
                key={w.days}
                onClick={() => setTrendingDays(w.days)}
                className={[
                  'px-2.5 py-1 font-medium transition-colors',
                  trendingDays === w.days
                    ? 'bg-accent-emphasis text-white'
                    : 'text-fg-muted hover:text-fg border-l border-border first:border-l-0',
                ].join(' ')}
              >
                {w.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ranked list */}
      <ol className="space-y-2">
        {entries.map((entry, i) => {
          const meta = repoMeta.get(entry.repo.fullName)
          const isSafe = entry.repo.htmlUrl.startsWith('https://github.com/')

          return (
            <li
              key={entry.repo.fullName}
              className="bg-canvas border border-border rounded-lg p-4 flex items-start gap-3"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-6 shrink-0 mt-0.5">
                <MedalIcon rank={i + 1} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isSafe ? (
                    <a
                      href={entry.repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-accent-fg hover:underline truncate"
                    >
                      {entry.repo.fullName}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-fg truncate">
                      {entry.repo.fullName}
                    </span>
                  )}

                  {/* Activity badges */}
                  <div className="flex items-center gap-2 text-xs text-fg-subtle shrink-0">
                    {entry.starCount > 0 && (
                      <span title={`${entry.starCount} people in feed starred this`}>
                        ⭐ {entry.starCount}
                      </span>
                    )}
                    {entry.forkCount > 0 && (
                      <span title={`${entry.forkCount} people in feed forked this`}>
                        🍴 {entry.forkCount}
                      </span>
                    )}
                  </div>
                </div>

                {meta?.description && (
                  <p className="mt-1 text-xs text-fg-muted line-clamp-1">
                    {meta.description}
                  </p>
                )}

                {meta && (
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-fg-subtle">
                    {meta.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent-emphasis inline-block" />
                        {meta.language}
                      </span>
                    )}
                    <span>⭐ {formatCount(meta.stargazersCount)} total</span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {entries.length > 0 && (
        <p className="text-center text-xs text-fg-subtle pt-2">
          Ranked by activity from people in your network.
        </p>
      )}
    </div>
  )
}
