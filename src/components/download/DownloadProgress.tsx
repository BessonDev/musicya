import { useDownloadStore } from '@/stores/useDownloadStore'
import { getQualityLabel } from './QualitySelector'

/**
 * Barra de progreso de descarga con estado
 * Muestra el progreso actual de la descarga en curso
 */
export function DownloadProgress() {
  const { currentDownload, cancelDownload, clearCurrent } = useDownloadStore()

  if (!currentDownload) {
    return null
  }

  const { track, progress, status, error } = currentDownload
  const isDownloading = status === 'downloading'
  const isCompleted = status === 'completed'
  const isError = status === 'error' || status === 'cancelled'

  const handleCancel = () => {
    cancelDownload()
  }

  const handleClear = () => {
    clearCurrent()
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      {/* Track info */}
      <div className="flex items-center gap-3 mb-3">
        {track.coverUrl && (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {track.title}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {track.artist}
          </p>
        </div>
        <span className="text-xs text-zinc-500">
          {getQualityLabel(currentDownload.quality)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-surface-hover rounded-full overflow-hidden mb-2">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
            isError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />

        {/* Animated stripes when downloading */}
        {isDownloading && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
            }}
          />
        )}
      </div>

      {/* Status text and actions */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isError
              ? 'text-red-400'
              : isCompleted
                ? 'text-green-400'
                : 'text-zinc-400'
          }`}
        >
          {isDownloading
            ? `Descargando... ${Math.round(progress)}%`
            : isCompleted
              ? 'Completado'
              : isError
                ? error || 'Error'
                : 'Pendiente'}
        </span>

        <div className="flex gap-2">
          {isDownloading && (
            <button
              onClick={handleCancel}
              className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-red-400
                         hover:bg-red-500/10 transition-colors"
            >
              Cancelar
            </button>
          )}
          {(isCompleted || isError) && (
            <button
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-foreground
                         hover:bg-surface-hover transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}