import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchStore } from '@/stores/useSearchStore'
import { useDebounce } from '@/hooks/useDebounce'
import { searchTracks } from '@/services/synkApi'
import { SearchHistory } from './SearchHistory'

/**
 * Componente de búsqueda con debounce de 300ms
 * Historial accesible mediante botón toggle
 */
export function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 300)
  const [showHistory, setShowHistory] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    setResults,
    setLoading,
    setError,
    setQuery,
    addToHistory,
    isLoading,
    history,
  } = useSearchStore()

  // Cerrar historial al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev)
  }, [])

  const handleHistorySelect = useCallback((query: string) => {
    setInputValue(query)
    setShowHistory(false)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    setResults([])
  }, [setResults])

  // Posición del botón de historial: al lado del clear o fijo a la derecha
  const hasHistory = history.length > 0

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
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
          placeholder="Buscar canciones, artistas, álbumes..."
          className="w-full pl-12 pr-12 py-3 bg-surface border border-border rounded-xl
                     text-foreground placeholder-zinc-500
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     transition-colors duration-200"
          autoFocus
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {isLoading && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}

          {hasHistory && !isLoading && (
            <button
              onClick={toggleHistory}
              title="Historial de búsquedas"
              className={`p-1.5 rounded-lg transition-colors ${
                showHistory
                  ? 'text-primary bg-primary/10'
                  : 'text-zinc-400 hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}

          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-foreground hover:bg-surface-hover transition-colors"
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
        </div>
      </div>

      {showHistory && <SearchHistory onSelect={handleHistorySelect} />}
    </div>
  )
}