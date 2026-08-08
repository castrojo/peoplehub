import type { SocialPost } from '../types/social'
import { SocialPostCard } from './SocialPostCard'

interface SocialFeedListProps {
  posts: SocialPost[]
  status: 'idle' | 'loading' | 'success' | 'error'
  failedSources: string[]
  onRetry: () => void
}

function SkeletonCard() {
  return (
    <div className="bg-canvas border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-canvas-subtle" />
        <div className="h-3 w-32 rounded bg-canvas-subtle" />
      </div>
      <div className="mt-3 h-3 w-full rounded bg-canvas-subtle" />
      <div className="mt-1 h-3 w-3/4 rounded bg-canvas-subtle" />
    </div>
  )
}

export function SocialFeedList({ posts, status, failedSources, onRetry }: SocialFeedListProps) {
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
        <p className="text-fg-muted mb-4">Could not reach any social networks.</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md bg-accent-emphasis text-white text-sm hover:opacity-90"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'success' && posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-fg-muted">No posts found yet.</p>
        <p className="text-fg-subtle text-sm mt-1">Be the first to post with the hashtag!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <SocialPostCard key={post.id} post={post} />
      ))}
      {failedSources.length > 0 && (
        <p className="text-center text-xs text-fg-subtle py-2">
          ⚠️ Could not reach: {failedSources.join(', ')}
        </p>
      )}
    </div>
  )
}
