import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTrack = {
  trackId: 3135556,
  trackName: 'Without Me',
  artistName: 'Eminem',
  collectionName: 'The Eminem Show',
  previewUrl: 'https://audio-ssl.itunes.apple.com/preview.m4a',
  artworkUrl100: 'https://is1-ssl.mzstatic.com/image/100x100.jpg',
  trackTimeMillis: 290120,
  primaryGenreName: 'Hip-Hop/Rap',
  releaseDate: '2002-05-14T07:00:00Z',
  trackNumber: 9,
  collectionId: 1440821542,
}

describe('searchTracks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array for empty query', async () => {
    const { searchTracks } = await import('@/services/synkApi')
    const result = await searchTracks('')
    expect(result).toEqual([])
  })

  it('returns tracks for a valid query', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        resultCount: 1,
        results: [mockTrack],
      }),
    })

    const { searchTracks } = await import('@/services/synkApi')
    const result = await searchTracks('eminem')

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Without Me')
    expect(result[0].artist).toBe('Eminem')
    expect(result[0].album).toBe('The Eminem Show')
    expect(result[0].duration).toBe(290)
    expect(result[0].previewUrl).toBe(mockTrack.previewUrl)
    expect(result[0].coverUrl).toBe('https://is1-ssl.mzstatic.com/image/300x300.jpg')
    expect(result[0].year).toBe(2002)
    expect(result[0].genre).toBe('Hip-Hop/Rap')
  })

  it('throws on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    })

    const { searchTracks } = await import('@/services/synkApi')
    await expect(searchTracks('eminem')).rejects.toThrow()
  })

  it('handles network errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { searchTracks } = await import('@/services/synkApi')
    await expect(searchTracks('eminem')).rejects.toThrow()
  })
})
