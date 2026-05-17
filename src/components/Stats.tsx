import { useEffect, useState } from 'react'

interface StatsData {
  visits: number
  downloads: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplay(0)
      return
    }

    const duration = 800
    const start = performance.now()
    const from = display

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + (value - from) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [value])

  return <span>{display.toLocaleString()}</span>
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    const visited = sessionStorage.getItem('musicya_visited')
    if (!visited) {
      fetch('/api/stats/visit', { method: 'POST' }).catch(() => {})
      sessionStorage.setItem('musicya_visited', '1')
    }

    fetch('/api/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Visits */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-primary leading-none">
            <AnimatedNumber value={stats.visits} />
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">visitas</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border/50" />

      {/* Downloads */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-accent leading-none">
            <AnimatedNumber value={stats.downloads} />
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">descargas</p>
        </div>
      </div>
    </div>
  )
}
