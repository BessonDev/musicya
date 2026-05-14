import { useCallback, useState } from 'react'
import type { Track } from '@/types'
import { useDownloadStore } from '@/stores/useDownloadStore'
import { downloadTrack, generateFilename } from '@/services/downloadService'

interface DownloadButtonProps {
  track: Track
  compact?: boolean
}

/**
 * Botón de descarga con progreso
 * Maneja el inicio de descarga y muestra estado
 */
export function DownloadButton({ track, compact = false }: DownloadButtonProps) {
  const { currentDownload, preferredQuality, startDownload, updateProgress, setStatus } =
    useDownloadStore()

  const [isLoading, setIsLoading] = useState(false)

  // Verificar si esta.track está siendo descargada actualmente
  const isCurrentDownload = currentDownload?.track.id === track.id
  const isDownloading = isCurrentDownload && currentDownload?.status === 'downloading'
  const isCompleted = isCurrentDownload && currentDownload?.status === 'completed'
  const progress = currentDownload?.progress ?? 0

  const handleDownload = useCallback(async () => {
    if (isDownloading || isLoading) return

    try {
      setIsLoading(true)
      startDownload(track, preferredQuality)

      // Simular progreso inicial
      updateProgress(10)

      // Descargar el archivo
      const blob = await downloadTrack(track, preferredQuality, (p) => {
        // Mapeamos progreso de 10-100
        updateProgress(10 + p * 0.9)
      })

      const url = URL.createObjectURL(blob)
      const filename = generateFilename(track)

      // Crear elemento <a> para descargar
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatus('completed')
    } catch (error) {
      console.error('Download error:', error)
      setStatus('error', error instanceof Error ? error.message : 'Error al descargar')
    } finally {
      setIsLoading(false)
    }
  }, [track, preferredQuality, isDownloading, isLoading, startDownload, updateProgress, setStatus])

  if (compact) {
    // Modo compacto para ResultCard
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading || isLoading}
        className="p-2 rounded-lg bg-surface-hover hover:bg-primary/20
                   text-zinc-400 hover:text-primary transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          isCompleted
            ? 'Descargado'
            : isDownloading
              ? `Descargando ${Math.round(progress)}%`
              : 'Descargar'
        }
      >
        {isDownloading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : isCompleted ? (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
      </button>
    )
  }

  // Modo completo
  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white
                 hover:bg-primary-hover transition-colors font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Descargando... {Math.round(progress)}%</span>
        </>
      ) : isCompleted ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span>Descargado</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Descargar</span>
        </>
      )}
    </button>
  )
}