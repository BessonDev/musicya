/**
 * Loading skeleton para resultados de búsqueda
 * Muestra 6 tarjetas simulando resultados
 */
export function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-surface rounded-xl p-4 border border-border animate-pulse"
        >
          {/* Thumbnail skeleton */}
          <div className="aspect-square bg-surface-hover rounded-lg mb-3" />

          {/* Title skeleton */}
          <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />

          {/* Artist skeleton */}
          <div className="h-3 bg-surface-hover rounded w-1/2 mb-3" />

          {/* Duration skeleton */}
          <div className="h-3 bg-surface-hover rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}