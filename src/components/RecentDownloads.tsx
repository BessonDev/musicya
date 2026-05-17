import { useState } from 'react'
import { getRecentDownloads } from '@/services/recentDownloads'

export function RecentDownloads() {
  const [open, setOpen] = useState(false)
  const downloads = getRecentDownloads()

  if (downloads.length === 0) return null

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `hace ${hours}h`
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Descargas recientes ({downloads.length})
      </button>

      {open && (
        <div className="mt-3 space-y-1">
          {downloads.map((d) => (
            <div key={`${d.id}-${d.downloadedAt}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 hover:bg-surface-hover transition-colors">
              {d.coverUrl ? (
                <img src={d.coverUrl} alt={d.title} className="w-9 h-9 rounded object-cover" />
              ) : (
                <div className="w-9 h-9 rounded bg-surface-hover flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{d.title}</p>
                <p className="text-xs text-zinc-500 truncate">{d.artist}</p>
              </div>
              <span className="text-[11px] text-zinc-600 whitespace-nowrap">{formatDate(d.downloadedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
