import { SearchInput, SearchResults } from '@/components/search'
import { AudioPlayer } from '@/components/player'
import { DownloadProgress } from '@/components/download'

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
          <div className="text-center mb-8">
            {/* Icon with gradient bg */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent
                            flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            </div>

            {/* Gradient title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent
                           bg-clip-text text-transparent tracking-tight leading-tight">
              Musicya
            </h1>

            {/* Subtitle with decorative lines */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-600" />
              <p className="text-zinc-400 text-sm font-medium tracking-wider uppercase">
                Descarga música gratis
              </p>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-600" />
            </div>

            <p className="text-xs text-zinc-600 mt-4 tracking-wide">
              Desarrollado por{' '}
              <a
                href="https://bessondev.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary transition-colors font-medium"
              >
                bessondev
              </a>
            </p>
          </div>

          {/* Search */}
          <SearchInput />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SearchResults />
        <DownloadProgress />
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 border-t border-border/30">
        <p className="text-xs text-zinc-600">
          Datos extraídos legítimamente de la iTunes Search API y descargas desde YouTube
        </p>
      </footer>

      {/* Audio Player Footer */}
      <AudioPlayer />
    </div>
  )
}