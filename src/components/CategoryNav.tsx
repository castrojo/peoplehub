import { CNCF_CATEGORIES } from '../lib/cncfData'

interface CategoryNavProps {
  active: string | null
  onChange: (cat: string | null) => void
}

export function CategoryNav({ active, onChange }: CategoryNavProps) {
  const tabs: Array<{ label: string; value: string | null }> = [
    { label: 'All', value: null },
    ...CNCF_CATEGORIES.map((cat) => ({ label: cat, value: cat })),
  ]

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
      role="group"
      aria-label="Filter by CNCF category"
    >
      {tabs.map(({ label, value }) => {
        const isActive = active === value
        return (
          <button
            key={label}
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={[
              'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              isActive
                ? 'bg-accent-emphasis text-white'
                : 'bg-canvas-subtle text-fg-muted hover:text-fg hover:bg-canvas-inset border border-border',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
