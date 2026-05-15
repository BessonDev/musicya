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
      previewUrl: track.previewUrl,
    }),
  })

  if (!resp.ok) {
    const friendlyMessages: Record<number, string> = {
      404: 'No se encontró la canción. Probá con otra búsqueda.',
      429: 'Estás descargando muy rápido. Esperá un momento y volvé a intentar.',
      504: 'La descarga tardó demasiado. Probá de nuevo.',
    }
    const err = await resp.json().catch(() => ({ detail: 'Error en la descarga' }))
    const statusMsg = friendlyMessages[resp.status]
    const detailMsg = err.detail || err.error || ''
    throw new Error(statusMsg || detailMsg || `Error al descargar (${resp.status})`)
  }

  onProgress?.(100)
  return await resp.blob()
}

export function generateFilename(track: Track): string {
  const cleanArtist = track.artist.replace(/[<>:"/\\|?*]/g, '').trim()
  const cleanTitle = track.title.replace(/[<>:"/\\|?*]/g, '').trim()
  return `${cleanArtist} - ${cleanTitle}.mp3`
}
