import type { Track } from '@/types'

const API_BASE = '/proxy/itunes'
const ITUNES_SEARCH_URL = `${API_BASE}/search`

interface ItunesResult {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  previewUrl: string
  artworkUrl100: string
  trackTimeMillis: number
  primaryGenreName: string
  releaseDate: string
  trackNumber: number
  collectionId: number
}

interface ItunesResponse {
  resultCount: number
  results: ItunesResult[]
}

function mapItunesTrack(r: ItunesResult): Track {
  return {
    id: String(r.trackId),
    deezerId: r.trackId,
    title: r.trackName,
    artist: r.artistName,
    album: r.collectionName,
    duration: Math.floor(r.trackTimeMillis / 1000),
    previewUrl: r.previewUrl || '',
    coverUrl: r.artworkUrl100?.replace('100x100', '300x300') || '',
    coverSmall: r.artworkUrl100 || '',
    coverMedium: r.artworkUrl100?.replace('100x100', '300x300') || '',
    coverBig: r.artworkUrl100?.replace('100x100', '600x600') || '',
    genre: r.primaryGenreName,
    year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : undefined,
  }
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return []

  const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&limit=25&media=music`
  const res = await fetch(url)

  if (!res.ok) {
    throw { message: `Error en la búsqueda: ${res.status}`, status: res.status }
  }

  const data: ItunesResponse = await res.json()
  return (data.results || []).map(mapItunesTrack)
}

export async function getTrack(trackId: number): Promise<Track> {
  const url = `${API_BASE}/lookup?id=${trackId}&limit=1`
  const res = await fetch(url)

  if (!res.ok) {
    throw { message: `Track no encontrado: ${res.status}`, status: res.status }
  }

  const data: ItunesResponse = await res.json()
  if (!data.results?.length) {
    throw { message: 'Track no encontrado', status: 404 }
  }

  return mapItunesTrack(data.results[0])
}

export function getStreamUrl(trackId: number): string {
  return `https://itunes.apple.com/lookup?id=${trackId}`
}
