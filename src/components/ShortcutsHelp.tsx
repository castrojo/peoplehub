interface ShortcutsHelpProps {
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['j', '↓'], label: 'Next item' },
  { keys: ['k', '↑'], label: 'Previous item' },
  { keys: ['l', '↵'], label: 'Open repo on GitHub' },
  { keys: ['h'], label: 'Back to top' },
  { keys: ['r'], label: 'Refresh feed' },
  { keys: ['?'], label: 'Toggle this help' },
  { keys: ['Esc'], label: 'Clear selection' },
]

export function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-canvas border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-fg text-sm">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="text-fg-subtle hover:text-fg text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {SHORTCUTS.map(({ keys, label }) => (
              <tr key={label} className="py-1">
                <td className="py-2 pr-4">
                  <span className="flex gap-1">
                    {keys.map(k => (
                      <kbd
                        key={k}
                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-border bg-canvas-subtle text-xs font-mono text-fg-muted min-w-[1.5rem]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </td>
                <td className="py-2 text-fg-muted">{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
