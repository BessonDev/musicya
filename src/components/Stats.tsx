import { useEffect, useState } from 'react'

interface StatsData {
  visits: number
  downloads: number
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    // Registrar visita única por sesión
    const visited = sessionStorage.getItem('visited')
    if (!visited) {
      fetch('/api/stats/visit', { method: 'POST' }).catch(() => {})
      sessionStorage.setItem('visited', '1')
    }

    // Obtener stats actuales
    fetch('/api/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
      <span>{stats.visits.toLocaleString()} visitas</span>
      <span className="text-zinc-700">·</span>
      <span>{stats.downloads.toLocaleString()} descargas</span>
    </div>
  )
}
