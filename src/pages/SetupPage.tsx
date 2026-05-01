import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsernameInput } from '../components/UsernameInput'
import { TeamInput } from '../components/TeamInput'

interface SetupPageProps {
  onSaveUsername: (username: string) => void
  onSaveTeam: (members: string[]) => void
  initialTab?: 'personal' | 'team'
}

type Tab = 'personal' | 'team'

export function SetupPage({ onSaveUsername, onSaveTeam, initialTab = 'personal' }: SetupPageProps) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(initialTab)

  const handleSaveUsername = (name: string) => {
    onSaveUsername(name)
    navigate('/')
  }

  const handleSaveTeam = (members: string[]) => {
    onSaveTeam(members)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fg">peoplehub</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Stars and forks from people you follow — nothing else.
          </p>
        </div>

        <div className="flex rounded-md border border-border mb-6 overflow-hidden">
          <button
            onClick={() => setTab('personal')}
            className={[
              'flex-1 py-2 text-sm font-medium transition-colors',
              tab === 'personal'
                ? 'bg-accent-emphasis text-white'
                : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            Personal feed
          </button>
          <button
            onClick={() => setTab('team')}
            className={[
              'flex-1 py-2 text-sm font-medium transition-colors border-l border-border',
              tab === 'team'
                ? 'bg-accent-emphasis text-white'
                : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            Team feed
          </button>
        </div>

        {tab === 'personal' ? (
          <UsernameInput onSave={handleSaveUsername} />
        ) : (
          <>
            <p className="text-xs text-fg-subtle mb-4">
              See what your teammates have starred and forked recently.
            </p>
            <TeamInput onSave={handleSaveTeam} />
          </>
        )}
      </div>
    </div>
  )
}
