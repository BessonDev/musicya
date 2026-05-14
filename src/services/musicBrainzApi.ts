import type { Track, MusicBrainzCoverResponse, ApiError } from '@/types'
import { fetchWithRetry } from './httpClient'

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2'

// User-Agent requerido por MusicBrainz
const USER_AGENT = 'MusicyaApp/1.0 (contact@musicya.app)'

// Rate limit: 1 request por segundo
const RATE_LIMIT_DELAY = 1100

let lastRequestTime = 0

/**
 * Espera para respetar rate limiting de MusicBrainz
 */
async function respectRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    )
  }

  lastRequestTime = Date.now()
}

/**
 * Busca metadatos enriquecidos por artista y título
 */
export async function searchMetadata(
  artist: string,
  title: string
): Promise<MusicBrainzCoverResponse['releases'] | null> {
  await respectRateLimit()

  const query = encodeURIComponent(`artist:${artist} AND recording:${title}`)
  const url = `${MUSICBRAINZ_BASE_URL}/release/?query=${query}&fmt=json&limit=5`

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw {
        message: `MusicBrainz error: ${response.status}`,
        status: response.status,
      } as ApiError
    }

    const data: MusicBrainzCoverResponse = await response.json()
    return data.releases || []
  } catch (error) {
    console.warn('MusicBrainz metadata search failed:', error)
    return null
  }
}

/**
 * Obtiene la carátula del álbum desde MusicBrainz
 */
export async function getCoverArt(
  releaseId: string
): Promise<string | null> {
  await respectRateLimit()

  // MusicBrainz redirect a coverartarchive.org
  const url = `https://coverartarchive.org/release/${releaseId}/front`

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      redirect: 'follow',
    })

    if (response.ok) {
      return response.url
    }
    return null
  } catch {
    return null
  }
}

/**
 * Busca cover art para un track específico
 */
export async function findCoverArt(track: Track): Promise<string | null> {
  // Primero intentar buscar por artista + título
  const releases = await searchMetadata(track.artist, track.title)

  if (!releases || releases.length === 0) {
    return null
  }

  // Obtener cover art del primer resultado
  const firstRelease = releases[0]

  // Intentar obtener cover art del release
  if (firstRelease.id) {
    const coverUrl = await getCoverArt(firstRelease.id)
    if (coverUrl) {
      return coverUrl
    }
  }

  return null
}

/**
 * Obtiene información de artista desde MusicBrainz
 */
export async function getArtistInfo(artistName: string): Promise<{
  name: string
  sortName: string
  disambiguation?: string
} | null> {
  await respectRateLimit()

  const query = encodeURIComponent(`artist:"${artistName}"`)
  const url = `${MUSICBRAINZ_BASE_URL}/artist/?query=${query}&fmt=json&limit=1`

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const artist = data.artists?.[0]

    if (!artist) {
      return null
    }

    return {
      name: artist.name,
      sortName: artist['sort-name'] || artist.name,
      disambiguation: artist.disambiguation,
    }
  } catch {
    return null
  }
}