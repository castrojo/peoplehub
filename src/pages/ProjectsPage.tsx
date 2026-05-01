import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFeed } from '../hooks/useFeed'
import { getCNCFProject } from '../lib/cncfData'

interface RepoSummary {
  fullName: string
  htmlUrl: string
  count: number
  cncfCategory?: string
  cncfMaturity?: 'graduated' | 'incubating'
}

function buildRepoList(items: ReturnType<typeof useFeed>['state']['items']): RepoSummary[] {
  const repoMap = new Map<string, RepoSummary>()

  for (const item of items) {
    const key = item.repo.fullName.toLowerCase()
    const existing = repoMap.get(key)
    if (existing) {
      existing.count += item.count
    } else {
      const cncf = getCNCFProject(item.repo.fullName)
      repoMap.set(key, {
        fullName: item.repo.fullName,
        htmlUrl: item.repo.htmlUrl,
        count: item.count,
        cncfCategory: cncf?.category,
        cncfMaturity: cncf?.maturity,
      })
    }
  }

  return Array.from(repoMap.values()).sort((a, b) => b.count - a.count)
}

export function ProjectsPage() {
  const { state } = useFeed()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const repos = useMemo(() => buildRepoList(state.items), [state.items])

  const filtered = useMemo(() => {
    if (!query.trim()) return repos
    const q = query.toLowerCase()
    return repos.filter((r) => r.fullName.toLowerCase().includes(q))
  }, [repos, query])

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border sticky top-0 bg-canvas z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-fg-muted hover:text-fg text-sm"
              aria-label="Back to feed"
            >
              ← Back
            </button>
            <h1 className="font-bold text-fg">Projects</h1>
          </div>
          <span className="text-xs text-fg-subtle">{repos.length} repos</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repos…"
          className="w-full mb-5 px-3 py-2 text-sm rounded-md border border-border bg-canvas-subtle text-fg placeholder-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          aria-label="Search repositories"
        />

        {state.isLoading && repos.length === 0 && (
          <div className="text-center py-16 text-fg-muted">
            Loading community data…
          </div>
        )}

        {!state.isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-fg-muted">
            {query ? 'No repos match your search.' : 'No repos in the collective feed yet.'}
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((repo) => {
            const isSafe = repo.htmlUrl.startsWith('https://github.com/')
            return (
              <div
                key={repo.fullName}
                className="bg-canvas border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  {isSafe ? (
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-accent-fg hover:underline truncate block"
                    >
                      {repo.fullName}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-fg truncate block">
                      {repo.fullName}
                    </span>
                  )}

                  {repo.cncfCategory && (
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        CNCF · {repo.cncfCategory}
                      </span>
                      {repo.cncfMaturity === 'graduated' ? (
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
                </div>

                <div className="text-xs text-fg-subtle shrink-0 text-right">
                  <span className="block">⭐ {repo.count}</span>
                  <span className="text-fg-subtle/60">activity</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
