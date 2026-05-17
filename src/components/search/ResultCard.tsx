import { useCallback, useState } from 'react'
import type { Track } from '@/types'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { DownloadButton } from '@/components/download'

interface ResultCardProps {
  track: Track
}

/**
 * Tarjeta individual de resultado de búsqueda
 * Muestra: thumbnail, título, artista, duración, botón de preview
 *
 * NO usa useAudioPlayer — el audio lo maneja exclusivamente
 * el footer (AudioPlayer) para evitar duplicación de Howl.
 * Acá solo interactuamos con el store.
 */
export function ResultCard({ track }: ResultCardProps) {
  const [copied, setCopied] = useState(false)
  const { currentTrack, isPlaying, setCurrentTrack } = usePlayerStore()

  const isCurrentTrack = currentTrack?.id === track.id
  const isPlayingThis = isCurrentTrack && isPlaying

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `Escuchá "${track.title}" - ${track.artist} en Musicya → https://musicya.bessondevproject.com`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback para navegadores sin clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [track])

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const { isPlaying: currentlyPlaying, play, pause } = usePlayerStore.getState()

    if (currentTrack?.id === track.id) {
      // Mismo track → toggle play/pause via store.
      // El hook en AudioPlayer reacciona al cambio de isPlaying.
      if (currentlyPlaying) {
        pause()
      } else {
        play()
      }
    } else {
      // Track diferente → solo seteamos, el hook auto-reproduce
      setCurrentTrack(track)
    }
  }, [track, setCurrentTrack])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="group bg-surface rounded-xl p-4 border border-border
                    hover:border-primary/50 hover:bg-surface-hover
                    transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-hover flex items-center justify-center">
            <svg
              className="w-12 h-12 text-zinc-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Play button overlay - siempre visible */}
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center
                     bg-black/40 hover:bg-black/50 transition-colors duration-200
                     cursor-pointer"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center
                          ${isPlayingThis ? 'bg-primary' : 'bg-primary/90'}
                          hover:bg-primary-hover transition-colors`}>
            {isPlayingThis ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>

        {/* Mini progress indicator when playing */}
        {isPlayingThis && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30">
            <div
              className="h-full bg-primary animate-pulse"
              style={{ width: '30%' }}
            />
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate mb-1">
            {track.title}
          </h3>
          <p className="text-sm text-zinc-400 truncate mb-2">
            {track.artist}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {formatDuration(track.duration)}
            </span>
            {track.album && (
              <span className="text-xs text-zinc-500 truncate max-w-[50%]">
                {track.album}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className={`p-2 rounded-lg transition-colors ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-surface-hover text-zinc-400 hover:text-zinc-300'
            }`}
            title={copied ? '¡Copiado!' : 'Compartir'}
          >
            {copied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          <DownloadButton track={track} compact />
        </div>
      </div>
    </div>
  )
}