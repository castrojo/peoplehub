import { useState } from 'react'
import { CNCF_PILLARS, type CNCFPillarId } from '../lib/cncfData'

interface PillarNavProps {
  active: CNCFPillarId | null
  onChange: (pillar: CNCFPillarId | null) => void
}

// Featured curation strip for the 5 pillars pushing cloud native + AI
// forward (see castrojo/peoplehub#25). This sits above the general
// CNCF landscape category tabs since it's the primary way we want to
// help people discover what's moving the industry right now.
export function PillarNav({ active, onChange }: PillarNavProps) {
  const [showInfo, setShowInfo] = useState<string | null>(null)

  return (
    <div className="mb-4 rounded-lg border border-border bg-canvas-subtle p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          🚀 Cloud Native AI Pillars
        </h2>
        {active && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-accent-fg hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
        role="group"
        aria-label="Filter by cloud native AI pillar"
      >
        {CNCF_PILLARS.map((pillar) => {
          const isActive = active === pillar.id
          return (
            <button
              key={pillar.id}
              aria-pressed={isActive}
              title={pillar.description}
              onClick={() => onChange(isActive ? null : pillar.id)}
              onMouseEnter={() => setShowInfo(pillar.id)}
              onMouseLeave={() => setShowInfo(null)}
              onFocus={() => setShowInfo(pillar.id)}
              onBlur={() => setShowInfo(null)}
              className={[
                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border',
                isActive
                  ? 'bg-accent-emphasis text-white border-transparent'
                  : 'bg-canvas text-fg-muted hover:text-fg hover:bg-canvas-inset border-border',
              ].join(' ')}
            >
              <span aria-hidden="true">{pillar.icon}</span>
              {pillar.label}
            </button>
          )
        })}
      </div>

      {showInfo && (
        <p className="mt-2 text-xs text-fg-subtle">
          {CNCF_PILLARS.find((p) => p.id === showInfo)?.description}
        </p>
      )}
    </div>
  )
}
