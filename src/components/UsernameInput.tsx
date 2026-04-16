import { useState, type FormEvent } from 'react'

interface UsernameInputProps {
  onSave: (username: string) => void
  current?: string | null
}

export function UsernameInput({ onSave, current }: UsernameInputProps) {
  const [value, setValue] = useState(current ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter a GitHub username.')
      return
    }
    if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) {
      setError('GitHub usernames can only contain letters, numbers, and hyphens.')
      return
    }
    setError('')
    onSave(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-fg mb-1">
          GitHub username
        </label>
        <input
          id="username"
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder="e.g. castrojo"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-md border border-border bg-canvas-inset px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-accent-emphasis px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        View my feed
      </button>
    </form>
  )
}
