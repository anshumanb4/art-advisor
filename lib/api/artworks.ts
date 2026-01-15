import { Artwork } from '../types'
import { fetchMetArtworks } from './met'
import { fetchArticArtworks } from './artic'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function fetchArtworks(count: number = 50): Promise<Artwork[]> {
  // Fetch from both sources in parallel
  const [metArtworks, articArtworks] = await Promise.all([
    fetchMetArtworks(Math.ceil(count / 2)),
    fetchArticArtworks(Math.ceil(count / 2), Math.floor(Math.random() * 100) + 1),
  ])

  // Combine and shuffle
  const combined = [...metArtworks, ...articArtworks]
  return shuffleArray(combined)
}

export async function fetchMoreArtworks(
  existingIds: Set<string>,
  count: number = 20
): Promise<Artwork[]> {
  // Fetch more artworks, excluding ones we've already seen
  const newArtworks: Artwork[] = []
  const randomPage = Math.floor(Math.random() * 100) + 1

  const [metArtworks, articArtworks] = await Promise.all([
    fetchMetArtworks(count),
    fetchArticArtworks(count, randomPage),
  ])

  for (const artwork of [...metArtworks, ...articArtworks]) {
    if (!existingIds.has(artwork.id)) {
      newArtworks.push(artwork)
    }
  }

  return shuffleArray(newArtworks).slice(0, count)
}
