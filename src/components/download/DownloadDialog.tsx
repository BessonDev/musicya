import { useState, useEffect } from 'react'
import type { Track, DownloadQuality } from '@/types'
import { formatDuration } from '@/services/normalizer'

interface DownloadDialogProps {
  track: Track
  onConfirm: (quality: DownloadQuality) => void
  onCancel: () => void
}

export function DownloadDialog({ track, onConfirm, onCancel }: DownloadDialogProps) {
  const [selectedQuality, setSelectedQuality] = useState<DownloadQuality>(320)

  // Escape cierra el diálogo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4
                    shadow-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {track.title}
            </h3>
            <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Duration */}
        <p className="text-xs text-zinc-500 mb-4">
          Duración: {formatDuration(track.duration)} • Álbum: {track.album}
        </p>

        {/* Quality selector */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-zinc-300">Calidad de descarga</p>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              selectedQuality === 320
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="quality"
              value={320}
              checked={selectedQuality === 320}
              onChange={() => setSelectedQuality(320)}
              className="accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">320 kbps</p>
              <p className="text-xs text-zinc-500">Máxima calidad — mayor tamaño</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              selectedQuality === 128
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="quality"
              value={128}
              checked={selectedQuality === 128}
              onChange={() => setSelectedQuality(128)}
              className="accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">128 kbps</p>
              <p className="text-xs text-zinc-500">Menor tamaño — compatible</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-zinc-800 text-zinc-300 hover:bg-zinc-700
                       transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedQuality)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-primary text-white hover:bg-primary-hover
                       transition-colors"
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
