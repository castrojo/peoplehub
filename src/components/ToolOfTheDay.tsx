import { useState } from 'react'
import { CNCF_GRADUATED } from '../lib/cncfData'

function getTodayProject() {
  const date = new Date().toISOString().slice(0, 10)
  const hash = date.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return CNCF_GRADUATED[hash % CNCF_GRADUATED.length]
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
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                incubating
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
