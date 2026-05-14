import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'

/**
 * Player expandido en footer con controles completos
 * Solo visible cuando hay un track seleccionado
 */
export function AudioPlayer() {
  const { currentTrack } = usePlayerStore()

  if (!currentTrack) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm
                    border-t border-border px-4 py-3 z-40">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Center: Controls + Progress */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <PlayerControls />
          <div className="w-full max-w-xl">
            <ProgressBar />
          </div>
        </div>

        {/* Right: Volume */}
        <div className="w-40 hidden sm:flex justify-end">
          <VolumeControl />
        </div>
      </div>
    </div>
  )
}