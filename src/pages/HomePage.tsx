import { SearchInput, SearchResults } from '@/components/search'
import { AudioPlayer } from '@/components/player'

/**
 * Página principal con búsqueda y resultados
 * Layout: search header + results grid + player footer
 */
export function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm
                        border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Logo/Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              Musicya
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Descarga música MP3 gratis
            </p>
          </div>

          {/* Search */}
          <SearchInput />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SearchResults />
      </main>

      {/* Audio Player Footer */}
      <AudioPlayer />
    </div>
  )
}