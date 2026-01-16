import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export interface Artwork {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  imageUrl: string
  thumbnailUrl: string
  source: 'met' | 'artic' | 'cleveland' | 'rijks' | 'harvard' | 'smithsonian'
  sourceUrl: string
  department?: string
  culture?: string
  classification?: string
  description?: string
  dimensions?: string
  creditLine?: string
}

export interface SwipeEvent {
  artworkId: string
  liked: boolean
  timestamp: number
  sessionId: string
}

export interface TasteProfile {
  preferredMediums: { name: string; count: number }[]
  preferredDepartments: { name: string; count: number }[]
  preferredCultures: { name: string; count: number }[]
  favoriteArtists: string[]
  totalLiked: number
  totalSwiped: number
  summary: string
  lastUpdated: number
}

export interface Collection {
  artworks: Artwork[]
  addedAt: { [artworkId: string]: number }
}

export interface SwipeSession {
  id: string
  startedAt: number
  artworks: Artwork[]
  currentIndex: number
  liked: Artwork[]
  passed: Artwork[]
}
