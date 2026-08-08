import { useState } from 'react'
import { CNCF_PROJECTS, CNCF_PILLARS } from '../lib/cncfData'

function getTodayProject() {
  const d = new Date()
  // Use local date (not UTC) so daily rotation matches the user's clock
  const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const hash = dateStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  // Rotate through both graduated (established) and incubating/sandbox (newer)
  // projects so "Tool of the Day" surfaces a good mix of the two.
  return CNCF_PROJECTS[hash % CNCF_PROJECTS.length]
}

// No props needed — self-contained
export function ToolOfTheDay() {
  const [isExpanded, setIsExpanded] = useState(false)
  const project = getTodayProject()

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 bg-canvas-subtle hover:bg-canvas-inset transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-medium text-fg">🔧 Tool of the Day</span>
        <span className="text-fg-subtle text-xs select-none">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-canvas border-t border-border">
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-accent-fg hover:underline"
          >
            {project.name}
          </a>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Category badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-canvas-subtle text-fg-muted border border-border">
              {project.category}
            </span>

            {/* Maturity badge */}
            {project.maturity === 'graduated' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                graduated
              </span>
            ) : project.maturity === 'incubating' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                incubating
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                sandbox
              </span>
            )}

            {/* Pillar badges */}
            {project.pillars?.map((pillarId) => {
              const pillar = CNCF_PILLARS.find((p) => p.id === pillarId)
              if (!pillar) return null
              return (
                <span
                  key={pillarId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent-emphasis/10 text-accent-fg border border-accent-emphasis/30"
                >
                  <span aria-hidden="true">{pillar.icon}</span>
                  {pillar.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
