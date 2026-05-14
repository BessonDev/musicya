import { useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '@/stores/usePlayerStore'

/**
 * Hook para manejar reproducción de audio con Howler.js
 *
 * - Cuando cambia `currentTrack`, reproduce automáticamente el nuevo track.
 * - Sincroniza el estado `isPlaying` con el estado real del Howl.
 * - Si el usuario hizo pause y cambia de track, el nuevo también arranca solo.
 */
export function useAudioPlayer() {
  const howlRef = useRef<Howl | null>(null)
  const trackIdRef = useRef<string | null>(null)

  const {
    currentTrack,
    setProgress,
    setDuration,
    setIsPlaying,
    volume,
    isMuted,
  } = usePlayerStore()

  const progressLoopIdRef = useRef<number | null>(null)

  // Gestiona el track actual: limpia el anterior, crea el nuevo, y auto-play
  useEffect(() => {
    if (!currentTrack) {
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
        trackIdRef.current = null
      }
      setIsPlaying(false)
      setProgress(0)
      setDuration(0)
      return
    }

    // Si es el mismo track, no hacer nada
    if (trackIdRef.current === currentTrack.id && howlRef.current) {
      return
    }

    // Limpiar track anterior
    if (howlRef.current) {
      howlRef.current.unload()
    }
    if (progressLoopIdRef.current !== null) {
      cancelAnimationFrame(progressLoopIdRef.current)
      progressLoopIdRef.current = null
    }

    // Crear nuevo Howl
    const howl = new Howl({
      src: [currentTrack.previewUrl],
      html5: true,
      volume: isMuted ? 0 : volume / 100,
      onload: () => {
        setDuration(howl.duration())
      },
      onplay: () => {
        setIsPlaying(true)
        loopProgress()
      },
      onpause: () => {
        setIsPlaying(false)
        cancelProgress()
      },
      onstop: () => {
        setIsPlaying(false)
        setProgress(0)
        cancelProgress()
      },
      onend: () => {
        setIsPlaying(false)
        setProgress(0)
        cancelProgress()
      },
      onloaderror: (_id, error) => {
        console.error('Error loading audio:', error)
        setIsPlaying(false)
      },
      onplayerror: (_id, error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      },
    })

    howlRef.current = howl
    trackIdRef.current = currentTrack.id

    // ► Auto-play: el nuevo track arranca apenas se crea
    howl.play()
  }, [currentTrack, setDuration, setIsPlaying, setProgress])

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume / 100)
    }
  }, [volume, isMuted])

  // Sincronizar isPlaying del store con el Howl.
  // Permite que ResultCard haga store.play()/pause() y el Howl reaccione.
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  useEffect(() => {
    if (!howlRef.current) return
    const howl = howlRef.current
    if (isPlaying && !howl.playing()) {
      howl.play()
    } else if (!isPlaying && howl.playing()) {
      howl.pause()
    }
  }, [isPlaying])

  // Bucle de progreso con requestAnimationFrame
  const loopProgress = useCallback(() => {
    const tick = () => {
      if (howlRef.current && howlRef.current.playing()) {
        setProgress(howlRef.current.seek() as number)
        progressLoopIdRef.current = requestAnimationFrame(tick)
      }
    }
    cancelProgress()
    progressLoopIdRef.current = requestAnimationFrame(tick)
  }, [setProgress])

  const cancelProgress = useCallback(() => {
    if (progressLoopIdRef.current !== null) {
      cancelAnimationFrame(progressLoopIdRef.current)
      progressLoopIdRef.current = null
    }
  }, [])

  // Play manual (para reanudar después de pause)
  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play()
    }
  }, [])

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop()
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time)
      setProgress(time)
    }
  }, [setProgress])

  return {
    play,
    pause,
    stop,
    seek,
  }
}