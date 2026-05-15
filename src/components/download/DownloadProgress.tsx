import { useDownloadStore } from '@/stores/useDownloadStore'
import { getQualityLabel } from './QualitySelector'

export function DownloadProgress() {
  const { currentDownload, clearCurrent } = useDownloadStore()

  if (!currentDownload) {
    return null
  }

  const { track, progress, status } = currentDownload
  const isCompleted = status === 'completed'
  const isError = status === 'error' || status === 'cancelled'

  if (isCompleted) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-right-2 fade-in">
        <div className="bg-green-900/90 text-green-200 border border-green-700/50 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-green-300/70">Descarga completada</p>
          </div>
          <button
            onClick={clearCurrent}
            className="shrink-0 ml-2 p-1 rounded-lg hover:bg-green-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-right-2 fade-in">
        <div className="bg-red-900/90 text-red-200 border border-red-700/50 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-red-300/70">{currentDownload.error || 'Error en la descarga'}</p>
          </div>
          <button
            onClick={clearCurrent}
            className="shrink-0 ml-2 p-1 rounded-lg hover:bg-red-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-right-2 fade-in">
      <div className="bg-surface/95 border border-border/80 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm min-w-[280px]">
        <div className="flex items-center gap-3 mb-2">
          {track.coverUrl && (
            <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
            <p className="text-xs text-zinc-400 truncate">{track.artist} · {getQualityLabel(currentDownload.quality)}</p>
          </div>
        </div>
        <div className="relative h-1.5 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 20px)',
            }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1.5">Descargando... {Math.round(progress)}%</p>
      </div>
    </div>
  )
}
