import type { Track, DownloadQuality } from '@/types'
import { writeId3Tags } from './id3Writer'
import { transcodeToMp3 } from './transcoder'

type ProgressCallback = (progress: number) => void

export async function downloadTrack(
  track: Track,
  quality: DownloadQuality,
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!track.previewUrl) {
    throw new Error('URL de preview no disponible')
  }

  onProgress?.(0)

  const response = await fetch(track.previewUrl)
  if (!response.ok) {
    throw new Error(`Error al descargar: ${response.status}`)
  }

  // 1. Descargar audio
  const audioBlob = await response.blob()
  onProgress?.(30)

  // 2. Descargar cover (opcional)
  let coverBlob: Blob | null = null
  if (track.coverUrl) {
    try {
      const coverResp = await fetch(track.coverUrl)
      if (coverResp.ok) coverBlob = await coverResp.blob()
    } catch { /* opcional */ }
  }
  onProgress?.(40)

  // 3. Transcodificar AAC → MP3
  const mp3Blob = await transcodeToMp3(audioBlob, quality)
  onProgress?.(75)

  // 4. Escribir metadatos ID3
  const taggedBlob = await writeId3Tags(mp3Blob, track, coverBlob)
  onProgress?.(100)

  return taggedBlob
}

export function generateFilename(track: Track): string {
  const cleanArtist = track.artist.replace(/[<>:"/\\|?*]/g, '').trim()
  const cleanTitle = track.title.replace(/[<>:"/\\|?*]/g, '').trim()
  return `${cleanArtist} - ${cleanTitle}.mp3`
}
