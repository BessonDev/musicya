import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  progress: number // segundos
  duration: number // segundos
  volume: number // 0-100
  isMuted: boolean

  // Actions
  setCurrentTrack: (track: Track | null) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  play: () => void
  pause: () => void
  stop: () => void
  reset: () => void
}

const DEFAULT_VOLUME = 70

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: DEFAULT_VOLUME,
      isMuted: false,

      setCurrentTrack: (track: Track | null) => {
        set({ currentTrack: track, progress: 0, duration: 0, isPlaying: false })
      },

      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

      setProgress: (progress: number) => set({ progress }),

      setDuration: (duration: number) => set({ duration }),

      setVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(100, volume))
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 })
      },

      toggleMute: () => {
        const { isMuted } = get()
        set({ isMuted: !isMuted })
      },

      setMuted: (muted: boolean) => set({ isMuted: muted }),

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      stop: () => {
        set({ isPlaying: false, progress: 0 })
      },

      reset: () => {
        set({
          currentTrack: null,
          isPlaying: false,
          progress: 0,
          duration: 0,
        })
      },
    }),
    {
      name: 'musicya-player-storage',
      partialize: (state) => ({ volume: state.volume }),
    }
  )
)