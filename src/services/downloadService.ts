import type { Track, DownloadQuality } from '@/types'

type ProgressCallback = (progress: number) => void

export async function downloadTrack(
  track: Track,
  quality: DownloadQuality,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.(0)

  const resp = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist: track.artist,
      title: track.title,
      quality,
      album: track.album,
      year: track.year,
      genre: track.genre,
      coverUrl: track.coverUrl,
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Error en la descarga' }))
    throw new Error(err.error || `Error ${resp.status}`)
  }

  onProgress?.(100)
  return await resp.blob()
}

export function generateFilename(track: Track): string {
  const cleanArtist = track.artist.replace(/[<>:"/\\|?*]/g, '').trim()
  const cleanTitle = track.title.replace(/[<>:"/\\|?*]/g, '').trim()
  return `${cleanArtist} - ${cleanTitle}.mp3`
}
