import type { SocialPost } from '../types/social'

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

const PLATFORM_ICON: Record<SocialPost['platform'], string> = {
  mastodon: '🐘',
  bluesky: '🦋',
}

export function SocialPostCard({ post }: { post: SocialPost }) {
  return (
    <article className="bg-canvas border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.handle}
              className="w-8 h-8 rounded-full shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-canvas-subtle shrink-0" />
          )}
          <div className="min-w-0">
            <a
              href={post.author.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fg hover:underline truncate block"
            >
              {post.author.name}
            </a>
            <span className="text-xs text-fg-subtle truncate block">{post.author.handle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-fg-subtle">
          <span title={post.platform}>{PLATFORM_ICON[post.platform]}</span>
          <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
        </div>
      </div>

      <p className="mt-3 text-sm text-fg whitespace-pre-wrap break-words">{post.text}</p>

      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-accent-fg hover:underline"
      >
        View on {post.source} ↗
      </a>
    </article>
  )
}
