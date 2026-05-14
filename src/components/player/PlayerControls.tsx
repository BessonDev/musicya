import { usePlayerStore } from '@/stores/usePlayerStore'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

/**
 * Controles del player: play/pause, prev, next
 */
export function PlayerControls() {
  const { isPlaying, currentTrack } = usePlayerStore()
  const { play, pause, stop } = useAudioPlayer()

  const handlePlayPause = () => {
    if (!currentTrack) return

    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handleStop = () => {
    stop()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previous - disabled por ahora */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full
                   text-zinc-400 hover:text-foreground hover:bg-surface-hover
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
        title="Anterior"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        className="w-12 h-12 flex items-center justify-center rounded-full
                   bg-primary hover:bg-primary-hover text-white
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentTrack}
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next - disabled por ahora */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full
                   text-zinc-400 hover:text-foreground hover:bg-surface-hover
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
        title="Siguiente"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        className="w-10 h-10 flex items-center justify-center rounded-full
                   text-zinc-400 hover:text-foreground hover:bg-surface-hover
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentTrack}
        title="Detener"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      </button>
    </div>
  )
}