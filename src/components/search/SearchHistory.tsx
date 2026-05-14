import { useSearchStore } from '@/stores/useSearchStore'

interface SearchHistoryProps {
  onSelect: (query: string) => void
}

/**
 * Dropdown con búsquedas recientes (últimas 10)
 * Persistidas en localStorage via Zustand persist
 */
export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { history, clearHistory } = useSearchStore()

  if (history.length === 0) {
    return null
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border
                    rounded-xl shadow-lg overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-sm text-zinc-400">Búsquedas recientes</span>
        <button
          onClick={clearHistory}
          className="text-sm text-primary hover:text-primary-hover
                     transition-colors"
        >
          Limpiar
        </button>
      </div>

      <ul className="max-h-64 overflow-y-auto">
        {history.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => onSelect(item.query)}
              className="w-full px-4 py-3 flex items-center justify-between
                         hover:bg-surface-hover transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-foreground">{item.query}</span>
              </div>
              <span className="text-xs text-zinc-500">
                {formatTimestamp(item.timestamp)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}