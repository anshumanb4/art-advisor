import { Artwork } from '../types'
import { fetchMetArtworks } from './met'
import { fetchArticArtworks } from './artic'
import { fetchClevelandArtworks } from './cleveland'
import { fetchRijksArtworks } from './rijks'
import { fetchHarvardArtworks } from './harvard'
import { fetchSmithsonianArtworks } from './smithsonian'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function fetchArtworks(count: number = 50): Promise<Artwork[]> {
  // Fetch from all sources in parallel
  // Each source contributes a portion of the total
  const perSource = Math.ceil(count / 6)

  const results = await Promise.allSettled([
    fetchMetArtworks(perSource),
    fetchArticArtworks(perSource, Math.floor(Math.random() * 100) + 1),
    fetchClevelandArtworks(perSource),
    fetchRijksArtworks(perSource),
    fetchHarvardArtworks(perSource),
    fetchSmithsonianArtworks(perSource),
  ])

  // Combine successful results
  const combined: Artwork[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value)
    }
  }

  return shuffleArray(combined)
}

export async function fetchMoreArtworks(
  existingIds: Set<string>,
  count: number = 20
): Promise<Artwork[]> {
  // Fetch more artworks, excluding ones we've already seen
  const perSource = Math.ceil(count / 6)
  const randomPage = Math.floor(Math.random() * 100) + 1

  const results = await Promise.allSettled([
    fetchMetArtworks(perSource),
    fetchArticArtworks(perSource, randomPage),
    fetchClevelandArtworks(perSource),
    fetchRijksArtworks(perSource),
    fetchHarvardArtworks(perSource),
    fetchSmithsonianArtworks(perSource),
  ])

  const newArtworks: Artwork[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const artwork of result.value) {
        if (!existingIds.has(artwork.id)) {
          newArtworks.push(artwork)
        }
      }
    }
  }

  return shuffleArray(newArtworks).slice(0, count)
}
