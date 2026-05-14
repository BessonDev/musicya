import type { Track, DownloadQuality } from '@/types'

type ProgressCallback = (progress: number) => void

/**
 * Descarga un track como Blob
 * NOTA: iTunes solo proporciona previews en formato AAC 128kbps.
 * La selección de calidad es una preferencia UI que se usará cuando
 * se implemente un backend con diferentes calidades.
 */
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

      if (done) {
        break
      }

      if (value) {
        chunks.push(value)
        received += value.length

        if (total > 0) {
          onProgress?.(Math.round((received / total) * 100))
        }
      }
    }

    // Combinar todos los chunks
    const allChunks = new Uint8Array(received)
    let position = 0
    for (const chunk of chunks) {
      allChunks.set(chunk, position)
      position += chunk.length
    }

    onProgress?.(100)

    // Determinar tipo MIME del contenido
    const contentType = response.headers.get('content-type') || 'audio/mp4'

    return new Blob([allChunks], { type: contentType })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al descargar')
  }
}

/**
 * Descarga la imagen de portada como Blob
 */
export async function downloadCoverArt(url: string): Promise<Blob | null> {
  if (!url) return null

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    return await response.blob()
  } catch {
    return null
  }
}

/**
 * Genera un nombre de archivo válido para la descarga
 */
export function generateFilename(track: Track): string {
  // Limpiar caracteres no válidos
  const cleanArtist = track.artist.replace(/[<>:"/\\|?*]/g, '').trim()
  const cleanTitle = track.title.replace(/[<>:"/\\|?*]/g, '').trim()

  return `${cleanArtist} - ${cleanTitle}.mp3`
}

/**
 * ID3 Metadata Embedding (PLACEHOLDER)
 * 
 * Esta función es un placeholder para implementación futura.
 * Actualmente, iTunes proporciona previews en formato AAC (.m4a),
 * no MP3, por lo que escribir metadatos ID3 requiere transcodificación.
 * 
 * Para implementar en el futuro:
 * 1. Usar un Web Worker con ffmpeg.wasm para transcodificar a MP3
 * 2. Usar jsmediatags o id3-writer para escribir tags ID3v2.3
 * 3. Embed cover art como frame APIC
 * 
 * Alternativa temporal: guardar metadata en archivo JSON sidecar
 */
export async function embedId3Metadata(
  _audioBlob: Blob,
  _track: Track,
  _coverBlob?: Blob
): Promise<Blob> {
  // TODO: Implementar cuando se tenga capacidad de transcodificación en browser
  // Por ahora, retornamos el blob original
  console.warn('ID3 embedding not yet implemented - returning original blob')
  return _audioBlob
}

/**
 * Crea un archivo descargable desde un Blob
 */
export function createDownloadLink(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob)
  
  // Opcional: crear enlace y autoseleccionar para descargar
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  
  return url
}