import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'

describe('useSearchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: '',
      results: [],
      history: [],
      isLoading: false,
      error: null,
    })
  })

  it('sets query', () => {
    useSearchStore.getState().setQuery('eminem')
    expect(useSearchStore.getState().query).toBe('eminem')
  })

  it('sets results and clears loading', () => {
    const track = {
      id: '1',
      title: 'Test',
      artist: 'Test',
      album: '',
      duration: 100,
      previewUrl: '',
      coverUrl: '',
      coverSmall: '',
      coverMedium: '',
      coverBig: '',
      deezerId: 1,
    }

    useSearchStore.getState().setLoading(true)
    expect(useSearchStore.getState().isLoading).toBe(true)

    useSearchStore.getState().setResults([track])
    expect(useSearchStore.getState().results).toHaveLength(1)
    expect(useSearchStore.getState().isLoading).toBe(false)
    expect(useSearchStore.getState().error).toBeNull()
  })

  it('adds to history', () => {
    useSearchStore.getState().addToHistory('eminem')
    expect(useSearchStore.getState().history).toHaveLength(1)
    expect(useSearchStore.getState().history[0].query).toBe('eminem')
  })

  it('does not add duplicate history', () => {
    useSearchStore.getState().addToHistory('eminem')
    useSearchStore.getState().addToHistory('eminem')
    expect(useSearchStore.getState().history).toHaveLength(1)
  })

  it('clears history', () => {
    useSearchStore.getState().addToHistory('eminem')
    useSearchStore.getState().clearHistory()
    expect(useSearchStore.getState().history).toHaveLength(0)
  })

  it('sets error and clears loading', () => {
    useSearchStore.getState().setLoading(true)
    useSearchStore.getState().setError('Algo salió mal')
    expect(useSearchStore.getState().error).toBe('Algo salió mal')
    expect(useSearchStore.getState().isLoading).toBe(false)
  })

  it('clears results', () => {
    useSearchStore.getState().setResults([{ id: '1', title: 'Test', artist: '', album: '', duration: 0, previewUrl: '', coverUrl: '', coverSmall: '', coverMedium: '', coverBig: '', deezerId: 1 }])
    useSearchStore.getState().clearResults()
    expect(useSearchStore.getState().results).toHaveLength(0)
  })
})
