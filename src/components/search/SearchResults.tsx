import { useSearchStore } from '@/stores/useSearchStore'
import { ResultCard } from './ResultCard'
import { SearchResultsSkeleton } from './SearchResultsSkeleton'

/**
 * Grid de resultados de búsqueda responsivo
 * 1col mobile, 2col tablet, 3-4col desktop
 */
export function SearchResults() {
  const { results, isLoading, error, query } = useSearchStore()

  if (isLoading) {
    return <SearchResultsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-zinc-600 mb-4"
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
        <p className="text-zinc-400 text-lg">Busca tu música favorita</p>
        <p className="text-zinc-500 text-sm mt-1">
          Encuentra canciones, artistas o álbumes
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-zinc-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-zinc-400 text-lg">No se encontraron resultados</p>
        <p className="text-zinc-500 text-sm mt-1">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {results.map((track) => (
        <ResultCard key={track.id} track={track} />
      ))}
    </div>
  )
}