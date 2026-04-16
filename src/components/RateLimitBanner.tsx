interface RateLimitBannerProps {
  retryAfter: number | null
  onDismiss: () => void
}

function formatResetTime(retryAfterMs: number | null): string {
  if (!retryAfterMs) return 'soon'
  const resetAt = new Date(Date.now() + retryAfterMs)
  return resetAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function RateLimitBanner({ retryAfter, onDismiss }: RateLimitBannerProps) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-canvas-subtle px-4 py-3 text-sm">
      <span className="text-lg shrink-0">☕</span>
      <div className="flex-1">
        <p className="font-medium text-fg">GitHub API rate limit reached.</p>
        <p className="text-fg-muted">
          Take a break — resets at {formatResetTime(retryAfter)}.
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-fg-subtle hover:text-fg shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
