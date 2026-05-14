import { useCallback } from 'react'
import type { Track } from '@/types'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { DownloadButton } from '@/components/download'

interface ResultCardProps {
  track: Track
}

/**
 * Tarjeta individual de resultado de búsqueda
 * Muestra: thumbnail, título, artista, duración, botón de preview
 */
export function ResultCard({ track }: ResultCardProps) {
  const { currentTrack, isPlaying, setCurrentTrack, play, pause } = usePlayerStore()
  const { play: playAudio, pause: pauseAudio } = useAudioPlayer()

  const isCurrentTrack = currentTrack?.id === track.id
  const isPlayingThis = isCurrentTrack && isPlaying

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (isCurrentTrack) {
      if (isPlaying) {
        pauseAudio()
        pause()
      } else {
        playAudio()
        play()
      }
    } else {
      setCurrentTrack(track)
      playAudio()
      play()
    }
  }, [isCurrentTrack, isPlaying, track, setCurrentTrack, playAudio, pauseAudio, play, pause])

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

        {/* Play button overlay */}
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center
                     bg-black/40 opacity-0 group-hover:opacity-100
                     transition-opacity duration-200"
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
        <DownloadButton track={track} compact />
      </div>
    </div>
  )
}