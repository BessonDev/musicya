import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track, DownloadQuality, DownloadStatus, DownloadItem } from '@/types'

interface DownloadState {
  currentDownload: DownloadItem | null
  queue: DownloadItem[]
  preferredQuality: DownloadQuality

  // Actions
  setPreferredQuality: (quality: DownloadQuality) => void
  startDownload: (track: Track, quality: DownloadQuality) => void
  updateProgress: (progress: number) => void
  setStatus: (status: DownloadStatus, error?: string) => void
  cancelDownload: () => void
  addToQueue: (track: Track, quality: DownloadQuality) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  clearCurrent: () => void
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      currentDownload: null,
      queue: [],
      preferredQuality: 320,

      setPreferredQuality: (quality: DownloadQuality) => {
        set({ preferredQuality: quality })
      },

      startDownload: (track: Track, quality: DownloadQuality) => {
        const newDownload: DownloadItem = {
          track,
          quality,
          progress: 0,
          status: 'downloading',
        }
        set({ currentDownload: newDownload })
      },

      updateProgress: (progress: number) => {
        const { currentDownload } = get()
        if (currentDownload) {
          set({
            currentDownload: {
              ...currentDownload,
              progress: Math.min(100, Math.max(0, progress)),
            },
          })
        }
      },

      setStatus: (status: DownloadStatus, error?: string) => {
        const { currentDownload } = get()
        if (currentDownload) {
          set({
            currentDownload: {
              ...currentDownload,
              status,
              error,
            },
          })
        }
      },

      cancelDownload: () => {
        const { currentDownload, queue } = get()
        if (currentDownload) {
          set({
            currentDownload: {
              ...currentDownload,
              status: 'cancelled',
            },
          })
          // If there are items in queue, promote next to current
          if (queue.length > 0) {
            const [next, ...rest] = queue
            set({
              currentDownload: { ...next, status: 'downloading' },
              queue: rest,
            })
          } else {
            set({ currentDownload: null })
          }
        }
      },

      addToQueue: (track: Track, quality: DownloadQuality) => {
        const { queue } = get()
        const newItem: DownloadItem = {
          track,
          quality,
          progress: 0,
          status: 'idle',
        }
        set({ queue: [...queue, newItem] })
      },

      removeFromQueue: (index: number) => {
        const { queue } = get()
        const newQueue = queue.filter((_, i) => i !== index)
        set({ queue: newQueue })
      },

      clearQueue: () => set({ queue: [] }),

      clearCurrent: () => set({ currentDownload: null }),
    }),
    {
      name: 'musicya-download-storage',
      partialize: (state) => ({ preferredQuality: state.preferredQuality }),
    }
  )
)