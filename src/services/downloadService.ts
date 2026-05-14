import type { Track, DownloadQuality } from '@/types'
import { writeId3Tags } from './id3Writer'

type ProgressCallback = (progress: number) => void

export async function downloadTrack(
  track: Track,
  _quality: DownloadQuality,
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!track.previewUrl) {
    throw new Error('URL de preview no disponible')
  }

  onProgress?.(0)

  try {
    const response = await fetch(track.previewUrl)

    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.status}`)
    }

    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (!response.body) {
      throw new Error('Respuesta sin cuerpo')
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let received = 0

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      if (value) {
        chunks.push(value)
        received += value.length

        if (total > 0) {
          onProgress?.(Math.round((received / total) * 100))
        }
      }
    }

    const allChunks = new Uint8Array(received)
    let position = 0
    for (const chunk of chunks) {
      allChunks.set(chunk, position)
      position += chunk.length
    }

    onProgress?.(100)

    const contentType = response.headers.get('content-type') || 'audio/mp4'
    const audioBlob = new Blob([allChunks], { type: contentType })

    let coverBlob: Blob | null = null
    if (track.coverUrl) {
      try {
        const coverResp = await fetch(track.coverUrl)
        if (coverResp.ok) {
          coverBlob = await coverResp.blob()
        }
      } catch {
        // Cover es opcional
      }
    }

    onProgress?.(95)

    const taggedBlob = await writeId3Tags(audioBlob, track, coverBlob)

    onProgress?.(100)
    return taggedBlob
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Error desconocido al descargar')
  }
}

export function generateFilename(track: Track): string {
  const cleanArtist = track.artist.replace(/[<>:"/\\|?*]/g, '').trim()
  const cleanTitle = track.title.replace(/[<>:"/\\|?*]/g, '').trim()
  return `${cleanArtist} - ${cleanTitle}.mp3`
}
