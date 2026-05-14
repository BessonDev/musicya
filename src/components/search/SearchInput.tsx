import { useState, useCallback, useEffect } from 'react'
import { useSearchStore } from '@/stores/useSearchStore'
import { useDebounce } from '@/hooks/useDebounce'
import { searchTracks } from '@/services/synkApi'
import { SearchHistory } from './SearchHistory'

/**
 * Componente de búsqueda con debounce de 300ms
 * Muestra historial de búsquedas recientes
 */
export function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 300)
  const [showHistory, setShowHistory] = useState(false)

  const {
    setResults,
    setLoading,
    setError,
    setQuery,
    addToHistory,
    isLoading,
  } = useSearchStore()

  // Realizar búsqueda cuando el valor debounced cambia
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedValue.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      setQuery(debouncedValue)
      try {
        const results = await searchTracks(debouncedValue)
        setResults(results)
        addToHistory(debouncedValue)
      } catch (err) {
        setError((err as Error).message || 'Error en la búsqueda')
      }
    }

    performSearch()
  }, [debouncedValue, setResults, setLoading, setError, setQuery, addToHistory])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleInputFocus = useCallback(() => {
    setShowHistory(true)
  }, [])

  const handleInputBlur = useCallback(() => {
    // Delay para permitir click en historial
    setTimeout(() => setShowHistory(false), 200)
  }, [])

  const handleHistorySelect = useCallback((query: string) => {
    setInputValue(query)
    setShowHistory(false)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    setResults([])
  }, [setResults])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Buscar canciones, artistas, álbumes..."
          className="w-full pl-12 pr-12 py-3 bg-surface border border-border rounded-xl
                     text-foreground placeholder-zinc-500
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     transition-colors duration-200"
          autoFocus
        />

        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center
                       text-zinc-400 hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {isLoading && (
          <div className="absolute inset-y-0 right-12 pr-4 flex items-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showHistory && <SearchHistory onSelect={handleHistorySelect} />}
    </div>
  )
}