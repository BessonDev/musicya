export type DownloadQuality = 128 | 320

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error' | 'cancelled'

export interface Track {
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
  year?: number
  genre?: string
  streamUrl?: string
  deezerId: number
}

export interface DeezerTrack {
  id: number
  title: string
  duration: number
  preview: string
  artist: {
    id: number
    name: string
    picture: string
    picture_small: string
    picture_medium: string
    picture_big: string
    picture_xl: string
  }
  album: {
    id: number
    title: string
    cover: string
    cover_small: string
    cover_medium: string
    cover_big: string
    cover_xl: string
  }
}

export interface DeezerSearchResponse {
  data: DeezerTrack[]
  total: number
  next?: string
}

export interface DeezerTrackDetail {
  id: number
  title: string
  duration: number
  preview: string
  artist: {
    id: number
    name: string
    picture: string
    picture_small: string
    picture_medium: string
    picture_big: string
    picture_xl: string
  }
  album: {
    id: number
    title: string
    cover: string
    cover_small: string
    cover_medium: string
    cover_big: string
    cover_xl: string
    release_date?: string
  }
  release_date?: string
  explicit_lyrics?: boolean
}

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  isMuted: boolean
}

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

export interface SearchStore {
  query: string
  results: Track[]
  history: SearchHistoryItem[]
  isLoading: boolean
  error: string | null
}

export interface DownloadItem {
  track: Track
  quality: DownloadQuality
  progress: number
  status: DownloadStatus
  error?: string
}

export interface DownloadStore {
  currentDownload: DownloadItem | null
  queue: DownloadItem[]
  preferredQuality: DownloadQuality
}

export interface MusicBrainzRelease {
  id: string
  title: string
  country: string
  date: string
  'cover-art-archive'?: {
    front: boolean
    back: boolean
  }
}

export interface MusicBrainzCoverResponse {
  releases: MusicBrainzRelease[]
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export interface RateLimitConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
}