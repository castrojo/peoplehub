import { useNavigate } from 'react-router-dom'
import { UsernameInput } from '../components/UsernameInput'

interface SetupPageProps {
  onSave: (username: string) => void
}

export function SetupPage({ onSave }: SetupPageProps) {
  const navigate = useNavigate()

  const handleSave = (name: string) => {
    onSave(name)
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
        <UsernameInput onSave={handleSave} />
      </div>
    </div>
  )
}
