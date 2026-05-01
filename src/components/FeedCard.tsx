import type { FeedItem, RepoMetadata } from '../types/github'
import { getCNCFProject } from '../lib/cncfData'

interface FeedCardProps {
  item: FeedItem
  meta: RepoMetadata | undefined
  isSelected?: boolean
  index: number
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function formatStarCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function ActorRow({ actors }: { actors: FeedItem['actors'] }) {
  const shown = actors.slice(0, 3)
  const rest = actors.length - shown.length

  const names = shown.map(a => (
    <a
      key={a.login}
      href={a.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent-fg hover:underline"
    >
      {a.login}
    </a>
  ))

  const nameParts: React.ReactNode[] = []
  names.forEach((n, i) => {
    nameParts.push(n)
    if (i < names.length - 2) nameParts.push(<span key={`sep-${i}`}>, </span>)
    else if (i === names.length - 2 && rest === 0) nameParts.push(<span key="and"> and </span>)
    else if (i === names.length - 2) nameParts.push(<span key="comma-last">, </span>)
  })
  if (rest > 0) nameParts.push(<span key="rest" className="text-fg-muted"> and {rest} others</span>)

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {shown.map(a => (
          <img
            key={a.login}
            src={a.avatarUrl}
            alt={a.login}
            className="w-6 h-6 rounded-full ring-2 ring-canvas"
          />
        ))}
      </div>
      <span className="text-sm text-fg">{nameParts}</span>
    </div>
  )
}

export function FeedCard({ item, meta, isSelected = false, index }: FeedCardProps) {
  const isSafe = item.repo.htmlUrl.startsWith('https://github.com/')
  const cncfProject = getCNCFProject(item.repo.fullName)

  return (
    <article
      data-feed-index={index}
      tabIndex={-1}
      className={[
        'bg-canvas border rounded-lg p-4 transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent-emphasis',
        isSelected
          ? 'border-l-4 border-l-accent-emphasis border-border bg-canvas-subtle'
          : 'border-border hover:border-border',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <ActorRow actors={item.actors} />

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm">
              {item.type === 'star' ? '⭐ Starred' : '🍴 Forked'}
            </span>
            {isSafe ? (
              <a
                href={item.repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-accent-fg hover:underline truncate"
              >
                {item.repo.fullName}
              </a>
            ) : (
              <span className="text-sm font-semibold text-fg truncate">
                {item.repo.fullName}
              </span>
            )}
          </div>

          {cncfProject && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                CNCF · {cncfProject.category}
              </span>
              {cncfProject.maturity === 'graduated' ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  graduated
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  incubating
                </span>
              )}
            </div>
          )}

          {meta?.description && (
            <p className="mt-1 text-sm text-fg-muted line-clamp-2">
              {meta.description}
            </p>
          )}

          {meta && (
            <div className="mt-2 flex items-center gap-3 text-xs text-fg-subtle">
              {meta.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-emphasis inline-block" />
                  {meta.language}
                </span>
              )}
              <span>⭐ {formatStarCount(meta.stargazersCount)}</span>
            </div>
          )}
        </div>

        <time
          dateTime={item.latestAt}
          className="text-xs text-fg-subtle whitespace-nowrap shrink-0"
        >
          {formatRelativeTime(item.latestAt)}
        </time>
      </div>
    </article>
  )
}
