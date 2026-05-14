import type { Track } from '@/types'

export function formatDuration(seconds: number): string {
  if (typeof seconds !== 'number' || seconds <= 0 || !isFinite(seconds)) {
    return '--:--'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function generateFileName(track: Track): string {
  const artist = sanitizeFilename(track.artist)
  const title = sanitizeFilename(track.title)
  return `${artist} - ${title}.mp3`
}

function sanitizeFilename(str: string): string {
  return str.replace(/[\\/:*?"<>|]/g, '_').slice(0, 200)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
