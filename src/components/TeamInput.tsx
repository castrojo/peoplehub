import { useState, type FormEvent } from 'react'
import { getOrgMembers } from '../lib/github'
import { TEAM_PRESETS } from '../lib/presets'

interface TeamInputProps {
  onSave: (members: string[]) => void
  current?: string[]
}

function parseUsernames(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map(s => s.trim().replace(/^@/, ''))
    .filter(s => /^[a-zA-Z0-9-]+$/.test(s))
}

export function TeamInput({ onSave, current }: TeamInputProps) {
  const [value, setValue] = useState(current ? current.join(', ') : '')
  const [orgValue, setOrgValue] = useState('')
  const [error, setError] = useState('')
  const [orgError, setOrgError] = useState('')
  const [loadingOrg, setLoadingOrg] = useState(false)
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)

  const mergeIntoValue = (usernames: string[]) => {
    const existing = parseUsernames(value)
    const merged = [...new Set([...existing, ...usernames])]
    setValue(merged.join(', '))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const members = parseUsernames(value)
    if (members.length === 0) {
      setError('Enter at least one valid GitHub username.')
      return
    }
    setError('')
    onSave(members)
  }

  const loadFromOrg = async (org: string): Promise<string | null> => {
    const result = await getOrgMembers(org)
    if ('error' in result) {
      if (result.error === 'not_found') return `Organization "${org}" not found.`
      if (result.error === 'rate_limited') return 'Rate limited. Try again later.'
      return 'Failed to load org members.'
    }
    if (result.data.length === 0) return `No public members found for "${org}".`
    mergeIntoValue(result.data)
    return null
  }

  const handleLoadPreset = async (presetId: string, org: string) => {
    setLoadingPreset(presetId)
    setOrgError('')
    const err = await loadFromOrg(org)
    setLoadingPreset(null)
    if (err) setOrgError(err)
  }

  const handleLoadOrg = async () => {
    const org = orgValue.trim()
    if (!org) {
      setOrgError('Enter an organization name.')
      return
    }
    setOrgError('')
    setLoadingOrg(true)
    const err = await loadFromOrg(org)
    setLoadingOrg(false)
    if (err) setOrgError(err)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-xs font-medium text-fg mb-2">Quick-load a group</p>
        <div className="flex flex-wrap gap-2">
          {TEAM_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset.id, preset.org)}
              disabled={loadingPreset !== null}
              title={preset.description}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-muted hover:text-fg hover:border-fg disabled:opacity-40 transition-colors"
            >
              {loadingPreset === preset.id ? 'Loading…' : preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Load from custom org */}
      <div>
        <p className="text-xs font-medium text-fg mb-1">Or load from any GitHub organization</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={orgValue}
            onChange={e => {
              setOrgValue(e.target.value)
              setOrgError('')
            }}
            placeholder="e.g. linuxfoundation"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-md border border-border bg-canvas-inset px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
          <button
            type="button"
            onClick={handleLoadOrg}
            disabled={loadingOrg || loadingPreset !== null}
            className="rounded-md border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg hover:border-fg disabled:opacity-40"
          >
            {loadingOrg ? 'Loading…' : 'Load'}
          </button>
        </div>
        {orgError && (
          <p className="mt-1 text-xs text-red-500">{orgError}</p>
        )}
      </div>

      {/* Manual list */}
      <div>
        <label htmlFor="team-members" className="block text-sm font-medium text-fg mb-1">
          Team members
        </label>
        <textarea
          id="team-members"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder="e.g. castrojo, thockin, dims"
          rows={4}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-md border border-border bg-canvas-inset px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-emphasis resize-none"
        />
        <p className="mt-1 text-xs text-fg-subtle">
          Comma- or space-separated GitHub usernames. Presets above are merged in.
        </p>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-accent-emphasis px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        View team feed
      </button>
    </form>
  )
}