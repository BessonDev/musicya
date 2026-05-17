import { useEffect, useState } from 'react'

interface SongEntry {
  title: string
  artist: string
  count: number
}

export function TopSongs() {
  const [songs, setSongs] = useState<SongEntry[] | null>(null)

  useEffect(() => {
    fetch('/api/stats/top-songs')
      .then((res) => res.json())
      .then(setSongs)
      .catch(() => {})
  }, [])

  if (!songs || songs.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        Más descargadas
      </h3>

      <div className="space-y-1">
        {songs.map((song, i) => (
          <div
            key={`${song.artist}-${song.title}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 hover:bg-surface-hover transition-colors"
          >
            {/* Rank badge */}
            <span className={`w-6 text-center text-sm font-bold ${
              i === 0 ? 'text-accent' :
              i === 1 ? 'text-primary' :
              i === 2 ? 'text-primary/70' :
              'text-zinc-600'
            }`}>
              {i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{song.title}</p>
              <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
            </div>

            <span className="text-xs text-zinc-600 whitespace-nowrap">
              {song.count} descarga{song.count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
