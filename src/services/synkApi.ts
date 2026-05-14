import type { Track } from '@/types'

const API_BASE = '/api'

interface TrackResponse {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  previewUrl: string
  coverUrl: string
  coverSmall: string
  coverMedium: string
  coverBig: string
  genre?: string | null
  year?: number | null
}

interface SearchResponse {
  results: TrackResponse[]
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return []

  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}`
  const res = await fetch(url)

  if (!res.ok) {
    throw { message: `Error en la búsqueda: ${res.status}`, status: res.status }
  }

  const data: SearchResponse = await res.json()
  return (data.results || []).map(mapTrack)
}

function mapTrack(r: TrackResponse): Track {
  return {
    id: r.id,
    deezerId: Number(r.id),
    title: r.title,
    artist: r.artist,
    album: r.album,
    duration: r.duration,
    previewUrl: r.previewUrl || '',
    coverUrl: r.coverUrl || '',
    coverSmall: r.coverSmall || '',
    coverMedium: r.coverMedium || '',
    coverBig: r.coverBig || '',
    genre: r.genre ?? undefined,
    year: r.year ?? undefined,
  }
}

export async function getTrack(trackId: number): Promise<Track> {
  // Re-use the search endpoint with the track ID as a lookup
  const url = `${API_BASE}/search?q=${trackId}&limit=1`
  const res = await fetch(url)

  if (!res.ok) {
    throw { message: `Track no encontrado: ${res.status}`, status: res.status }
  }

  const data: SearchResponse = await res.json()
  if (!data.results?.length) {
    throw { message: 'Track no encontrado', status: 404 }
  }

  return mapTrack(data.results[0])
}
