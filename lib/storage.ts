import { Artwork, Collection, TasteProfile, SwipeEvent } from './types'

const STORAGE_KEYS = {
  COLLECTION: 'art-advisor-collection',
  TASTE_PROFILE: 'art-advisor-taste-profile',
  SWIPE_HISTORY: 'art-advisor-swipe-history',
} as const

// Collection management
export function getCollection(): Collection {
  if (typeof window === 'undefined') {
    return { artworks: [], addedAt: {} }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.COLLECTION)
  if (!stored) {
    return { artworks: [], addedAt: {} }
  }

  try {
    return JSON.parse(stored)
  } catch {
    return { artworks: [], addedAt: {} }
  }
}

export function saveCollection(collection: Collection): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(collection))
}

export function addToCollection(artwork: Artwork): void {
  const collection = getCollection()

  // Don't add duplicates
  if (collection.artworks.some(a => a.id === artwork.id)) {
    return
  }

  collection.artworks.push(artwork)
  collection.addedAt[artwork.id] = Date.now()
  saveCollection(collection)
}

export function removeFromCollection(artworkId: string): void {
  const collection = getCollection()
  collection.artworks = collection.artworks.filter(a => a.id !== artworkId)
  delete collection.addedAt[artworkId]
  saveCollection(collection)
}

export function isInCollection(artworkId: string): boolean {
  const collection = getCollection()
  return collection.artworks.some(a => a.id === artworkId)
}

// Taste profile management
export function getTasteProfile(): TasteProfile | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(STORAGE_KEYS.TASTE_PROFILE)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function saveTasteProfile(profile: TasteProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TASTE_PROFILE, JSON.stringify(profile))
}

export function clearTasteProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.TASTE_PROFILE)
}

// Swipe history management
export function getSwipeHistory(): SwipeEvent[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEYS.SWIPE_HISTORY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveSwipeHistory(history: SwipeEvent[]): void {
  if (typeof window === 'undefined') return
  // Keep only last 500 swipes to avoid storage bloat
  const trimmed = history.slice(-500)
  localStorage.setItem(STORAGE_KEYS.SWIPE_HISTORY, JSON.stringify(trimmed))
}

export function addSwipeEvent(event: SwipeEvent): void {
  const history = getSwipeHistory()
  history.push(event)
  saveSwipeHistory(history)
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.COLLECTION)
  localStorage.removeItem(STORAGE_KEYS.TASTE_PROFILE)
  localStorage.removeItem(STORAGE_KEYS.SWIPE_HISTORY)
}
