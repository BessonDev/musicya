import { useCallback, useRef } from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'

interface ProgressBarProps {
  seek: (time: number) => void
}

/**
 * Barra de progreso clickeable con time display
 * Recibe seek por props desde AudioPlayer (único dueño del Howl).
 */
export function ProgressBar({ seek }: ProgressBarProps) {
  const { progress, duration } = usePlayerStore()
  const progressRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * duration

    seek(newTime)
  }, [duration, seek])

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-zinc-400 min-w-[40px] text-right">
        {formatTime(progress)}
      </span>

      <div
        ref={progressRef}
        onClick={handleClick}
        className="flex-1 h-2 bg-surface-hover rounded-full cursor-pointer
                   group relative overflow-hidden"
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full
                     group-hover:bg-primary-hover transition-colors"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full
                     shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>

      <span className="text-xs text-zinc-400 min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  )
}