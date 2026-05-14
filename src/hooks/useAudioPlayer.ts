import { useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '@/stores/usePlayerStore'

/**
 * Hook para manejar reproducción de audio con Howler.js
 * Asegura que solo un track reproduzca a la vez
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

  // Cleanup cuando el track cambia
  useEffect(() => {
    if (!currentTrack) {
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
        trackIdRef.current = null
      }
      return
    }

    // Si ya estamos reproduciendo este track, no crear nuevo
    if (trackIdRef.current === currentTrack.id && howlRef.current) {
      return
    }

    // Limpiar track anterior
    if (howlRef.current) {
      howlRef.current.unload()
    }

    // Crear nuevo Howl para el track
    const howl = new Howl({
      src: [currentTrack.previewUrl],
      html5: true, // Usar HTML5 Audio para streams grandes
      volume: isMuted ? 0 : volume / 100,
      onload: () => {
        setDuration(howl.duration())
      },
      onplay: () => {
        setIsPlaying(true)
        updateProgress()
      },
      onpause: () => {
        setIsPlaying(false)
      },
      onstop: () => {
        setIsPlaying(false)
        setProgress(0)
      },
      onend: () => {
        setIsPlaying(false)
        setProgress(0)
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
  }, [currentTrack, setDuration, setIsPlaying, setProgress])

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume / 100)
    }
  }, [volume, isMuted])

  // Intervalo para actualizar progress
  const updateProgress = useCallback(() => {
    if (howlRef.current && howlRef.current.playing()) {
      setProgress(howlRef.current.seek() as number)
      requestAnimationFrame(updateProgress)
    }
  }, [setProgress])

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