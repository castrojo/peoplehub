import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '../hooks/useConfig'

interface SetupPageProps {
  // token string on save (empty string = no token) — kept as string for
  // backward-compat with App.tsx which passes useUsername().setUsername
  onSave: (token: string) => void
}

export function SetupPage({ onSave }: SetupPageProps) {
  const navigate = useNavigate()
  const { setToken } = useConfig()
  const [tokenValue, setTokenValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = tokenValue.trim()
    if (trimmed) {
      setToken(trimmed)
    }
    // Pass token (or empty string) to parent; parent is a no-op shim now
    onSave(trimmed)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fg">awesome-cncf ✨</h1>
          <p className="mt-2 text-sm text-fg-muted">
            CNCF community collective intelligence feed
          </p>
          <p className="mt-1 text-xs text-fg-muted opacity-60">
            #puertorico-allhands-2027
          </p>
        </div>

        {/* Token form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-fg mb-1"
            >
              GitHub token{' '}
              <span className="font-normal text-fg-muted">(optional but recommended)</span>
            </label>
            <input
              id="token"
              type="password"
              value={tokenValue}
              onChange={e => setTokenValue(e.target.value)}
              placeholder="ghp_..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-border bg-canvas-inset px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
            />
            <p className="mt-1 text-xs text-fg-muted">
              Without a token, limited to 60 API requests/hour. A read-only public
              token gives 5,000/hour.{' '}
              <a
                href="https://github.com/settings/tokens/new?description=awesome-cncf&scopes=public_repo"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-fg"
              >
                Create one →
              </a>
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-accent-emphasis px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Enter the feed →
          </button>
        </form>

        {/* Easter egg */}
        <p className="mt-8 text-center text-xs text-fg-muted opacity-40">
          Powered by CNCF community data · Built with ❤️ on Bluefin
        </p>
      </div>
    </div>
  )
}
