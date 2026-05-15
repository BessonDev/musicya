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
      <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-primary/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p className="text-foreground text-xl font-medium mb-2">Busca tu música favorita</p>
        <p className="text-zinc-500 text-sm max-w-xs">
          Escribí el nombre de una canción, artista o álbum para empezar
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-foreground text-xl font-medium mb-2">Sin resultados</p>
        <p className="text-zinc-500 text-sm max-w-xs">
          No encontramos nada para <span className="text-zinc-400 font-medium">"{query}"</span>. Probá con otros términos.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {results.map((track, i) => (
        <div
          key={track.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <ResultCard track={track} />
        </div>
      ))}
    </div>
  )
}