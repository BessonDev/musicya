import { useCallback, useState } from 'react'
import type { Track, DownloadQuality } from '@/types'
import { useDownloadStore } from '@/stores/useDownloadStore'
import { downloadTrack, generateFilename } from '@/services/downloadService'
import { saveRecentDownload } from '@/services/recentDownloads'
import { DownloadDialog } from './DownloadDialog'

interface DownloadButtonProps {
  track: Track
  compact?: boolean
}

export function DownloadButton({ track, compact = false }: DownloadButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { currentDownload, startDownload, updateProgress, setStatus } = useDownloadStore()

  const isCurrentDownload = currentDownload?.track.id === track.id
  const isCompleted = isCurrentDownload && currentDownload?.status === 'completed'

  const handleConfirm = useCallback(async (quality: DownloadQuality) => {
    setShowDialog(false)
    if (isDownloading) return

    try {
      setIsDownloading(true)
      setProgress(0)
      startDownload(track, quality)

      const blob = await downloadTrack(track, quality, (p) => {
        setProgress(p)
        updateProgress(p)
      })

      const url = URL.createObjectURL(blob)
      const filename = generateFilename(track)

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      saveRecentDownload(track)
      setStatus('completed')
    } catch (error) {
      console.error('Download error:', error)
      setStatus('error', error instanceof Error ? error.message : 'Error al descargar')
    } finally {
      setIsDownloading(false)
    }
  }, [track, isDownloading, startDownload, updateProgress, setStatus])

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowDialog(true)}
          disabled={isDownloading}
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </button>

        {showDialog && (
          <DownloadDialog
            track={track}
            onConfirm={handleConfirm}
            onCancel={() => setShowDialog(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={isDownloading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white
                   hover:bg-primary-hover transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Procesando {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar</span>
          </>
        )}
      </button>

      {showDialog && (
        <DownloadDialog
          track={track}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  )
}
