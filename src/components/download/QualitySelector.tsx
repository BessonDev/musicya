import { useDownloadStore } from '@/stores/useDownloadStore'
import type { DownloadQuality } from '@/types'

const QUALITIES: { value: DownloadQuality; label: string; description: string }[] = [
  { value: 192, label: '192 kbps', description: 'Menor tamaño' },
  { value: 256, label: '256 kbps', description: 'Equilibrado' },
  { value: 320, label: '320 kbps', description: 'Máxima calidad' },
]

/**
 * Selector de calidad de descarga
 * dropdown con opciones 192/256/320 kbps
 */
export function QualitySelector() {
  const { preferredQuality, setPreferredQuality } = useDownloadStore()

  return (
    <div className="relative">
      <select
        value={preferredQuality}
        onChange={(e) => setPreferredQuality(Number(e.target.value) as DownloadQuality)}
        className="appearance-none bg-surface border border-border rounded-lg px-3 py-2 pr-8
                   text-sm text-foreground cursor-pointer hover:border-primary/50
                   focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        {QUALITIES.map((q) => (
          <option key={q.value} value={q.value}>
            {q.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * Obtiene la etiqueta legible para una calidad
 */
export function getQualityLabel(quality: DownloadQuality): string {
  return QUALITIES.find((q) => q.value === quality)?.label ?? `${quality} kbps`
}