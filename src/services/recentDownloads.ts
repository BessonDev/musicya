import type { Track } from '@/types'

export interface RecentDownload {
  id: string
  title: string
  artist: string
  album: string | null
  coverUrl: string | null
  downloadedAt: number
}

const STORAGE_KEY = 'musicya-recent-downloads'
const MAX_ITEMS = 20

export function getRecentDownloads(): RecentDownload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentDownload[]) : []
  } catch {
    return []
  }
}

export function saveRecentDownload(track: Track): void {
  const downloads = getRecentDownloads()

  // Evitar duplicados consecutivos
  if (downloads.length > 0 && downloads[0].id === track.id) return

  const entry: RecentDownload = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    coverUrl: track.coverUrl,
    downloadedAt: Date.now(),
  }

  const updated = [entry, ...downloads].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
