import { Artwork } from '../types'
import { fetchMetArtworks } from './met'
import { fetchArticArtworks } from './artic'
import { fetchClevelandArtworks } from './cleveland'
import { fetchRijksArtworks } from './rijks'
import { fetchHarvardArtworks } from './harvard'
import { fetchSmithsonianArtworks } from './smithsonian'
import { fetchVAMArtworks } from './vam'
import { fetchEuropeanaArtworks } from './europeana'
import { fetchNYPLArtworks } from './nypl'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Wrapper to add timeout to fetch calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ])
}

export async function fetchArtworks(count: number = 50): Promise<Artwork[]> {
  // Fetch from fast sources first (no API key needed, typically faster)
  const perFastSource = Math.ceil(count / 4) // 4 fast sources now
  const perSlowSource = Math.ceil(count / 5) // 5 slow sources

  // Fast sources (no API key) with 5s timeout
  const fastSources = [
    withTimeout(fetchMetArtworks(perFastSource), 5000),
    withTimeout(fetchArticArtworks(perFastSource, Math.floor(Math.random() * 100) + 1), 5000),
    withTimeout(fetchClevelandArtworks(perFastSource), 5000),
    withTimeout(fetchVAMArtworks(perFastSource), 5000), // V&A doesn't need API key
  ]

  // Slow sources (need API key) with 8s timeout
  const slowSources = [
    withTimeout(fetchRijksArtworks(perSlowSource), 8000),
    withTimeout(fetchHarvardArtworks(perSlowSource), 8000),
    withTimeout(fetchSmithsonianArtworks(perSlowSource), 8000),
    withTimeout(fetchEuropeanaArtworks(perSlowSource), 8000),
    withTimeout(fetchNYPLArtworks(perSlowSource), 10000), // NYPL needs more time (multiple API calls)
  ]

  // Get fast sources first, don't wait for slow ones
  const fastResults = await Promise.allSettled(fastSources)

  const combined: Artwork[] = []
  for (const result of fastResults) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value)
    }
  }

  // If we have enough from fast sources, fetch slow ones in background
  if (combined.length >= 10) {
    // Fire and forget - slow sources will be available on next fetch
    Promise.allSettled(slowSources).catch(() => {})
  } else {
    // Wait for slow sources if we don't have enough
    const slowResults = await Promise.allSettled(slowSources)
    for (const result of slowResults) {
      if (result.status === 'fulfilled') {
        combined.push(...result.value)
      }
    }
  }

  return shuffleArray(combined)
}

export async function fetchMoreArtworks(
  existingIds: Set<string>,
  count: number = 20
): Promise<Artwork[]> {
  // Fetch more artworks, excluding ones we've already seen
  const perSource = Math.ceil(count / 9) // 9 sources total
  const randomPage = Math.floor(Math.random() * 100) + 1

  const results = await Promise.allSettled([
    withTimeout(fetchMetArtworks(perSource), 5000),
    withTimeout(fetchArticArtworks(perSource, randomPage), 5000),
    withTimeout(fetchClevelandArtworks(perSource), 5000),
    withTimeout(fetchVAMArtworks(perSource), 5000),
    withTimeout(fetchRijksArtworks(perSource), 8000),
    withTimeout(fetchHarvardArtworks(perSource), 8000),
    withTimeout(fetchSmithsonianArtworks(perSource), 8000),
    withTimeout(fetchEuropeanaArtworks(perSource), 8000),
    withTimeout(fetchNYPLArtworks(perSource), 10000),
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
