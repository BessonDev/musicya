import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track, SearchHistoryItem } from '@/types'

interface SearchState {
  query: string
  results: Track[]
  history: SearchHistoryItem[]
  isLoading: boolean
  error: string | null
  setQuery: (query: string) => void
  setResults: (results: Track[]) => void
  addToHistory: (query: string) => void
  clearHistory: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearResults: () => void
}

const MAX_HISTORY_ITEMS = 10

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      history: [],
      isLoading: false,
      error: null,

      setQuery: (query: string) => set({ query }),

      setResults: (results: Track[]) => set({ results, error: null, isLoading: false }),

      addToHistory: (query: string) => {
        const { history } = get()
        const trimmedQuery = query.trim()

        if (!trimmedQuery) return

        // Remove existing entry if present
        const filtered = history.filter((item) => item.query !== trimmedQuery)

        // Add to front
        const newHistory = [
          { query: trimmedQuery, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY_ITEMS)

        set({ history: newHistory })
      },

      clearHistory: () => set({ history: [] }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error, isLoading: false }),

      clearResults: () => set({ results: [], error: null }),
    }),
    {
      name: 'musicya-search-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
)