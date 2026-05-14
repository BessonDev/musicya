import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '@/stores/usePlayerStore'

const mockTrack = {
  id: '1',
  title: 'Without Me',
  artist: 'Eminem',
  album: 'The Eminem Show',
  duration: 290,
  previewUrl: 'https://audio-ssl.itunes.apple.com/preview.m4a',
  coverUrl: 'https://is1-ssl.mzstatic.com/image/300x300.jpg',
  coverSmall: '',
  coverMedium: '',
  coverBig: '',
  deezerId: 1,
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: 80,
      isMuted: false,
    })
  })

  it('starts with default state', () => {
    const state = usePlayerStore.getState()
    expect(state.currentTrack).toBeNull()
    expect(state.isPlaying).toBe(false)
    expect(state.progress).toBe(0)
    expect(state.volume).toBe(80)
    expect(state.isMuted).toBe(false)
  })

  it('sets current track', () => {
    usePlayerStore.getState().setCurrentTrack(mockTrack)
    expect(usePlayerStore.getState().currentTrack?.id).toBe('1')
    expect(usePlayerStore.getState().currentTrack?.title).toBe('Without Me')
  })

  it('toggles play state', () => {
    usePlayerStore.getState().play()
    expect(usePlayerStore.getState().isPlaying).toBe(true)

    usePlayerStore.getState().pause()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('sets progress', () => {
    usePlayerStore.getState().setProgress(120)
    expect(usePlayerStore.getState().progress).toBe(120)
  })

  it('sets duration', () => {
    usePlayerStore.getState().setDuration(290)
    expect(usePlayerStore.getState().duration).toBe(290)
  })

  it('sets volume', () => {
    usePlayerStore.getState().setVolume(50)
    expect(usePlayerStore.getState().volume).toBe(50)
  })

  it('toggles mute', () => {
    usePlayerStore.getState().toggleMute()
    expect(usePlayerStore.getState().isMuted).toBe(true)

    usePlayerStore.getState().toggleMute()
    expect(usePlayerStore.getState().isMuted).toBe(false)
  })

  it('stops playback and resets progress', () => {
    usePlayerStore.getState().setCurrentTrack(mockTrack)
    usePlayerStore.getState().play()
    usePlayerStore.getState().setProgress(100)

    usePlayerStore.getState().stop()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    expect(usePlayerStore.getState().progress).toBe(0)
  })
})
