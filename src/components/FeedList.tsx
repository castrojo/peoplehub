import type { FeedItem, RepoMetadata } from '../types/github'
import { FeedCard } from './FeedCard'

interface FeedListProps {
  items: FeedItem[]
  repoMeta: Map<string, RepoMetadata>
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'
  isPartial: boolean
  selectedIndex: number | null
  onRetry: () => void
}

function SkeletonCard() {
  return (
    <div className="bg-canvas border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-canvas-subtle" />
        <div className="h-3 w-32 rounded bg-canvas-subtle" />
      </div>
      <div className="mt-3 h-3 w-48 rounded bg-canvas-subtle" />
      <div className="mt-2 h-3 w-full rounded bg-canvas-subtle" />
      <div className="mt-1 h-3 w-3/4 rounded bg-canvas-subtle" />
    </div>
  )
}

export function FeedList({ items, repoMeta, status, isPartial, selectedIndex, onRetry }: FeedListProps) {
  if (status === 'loading') {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16">
        <p className="text-fg-muted mb-4">Could not load feed.</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md bg-accent-emphasis text-white text-sm hover:opacity-90"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'success' && items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">👻</div>
        <p className="text-fg-muted">Your network has been quiet.</p>
        <p className="text-fg-subtle text-sm mt-1">Check back in a few hours.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <FeedCard
          key={item.id}
          item={item}
          meta={repoMeta.get(item.repo.fullName)}
          index={i}
          isSelected={selectedIndex === i}
        />
      ))}
      {isPartial && (
        <p className="text-center text-xs text-fg-subtle py-2">
          ℹ️ Showing the most recent ~300 events from your network.
        </p>
      )}
    </div>
  )
}
