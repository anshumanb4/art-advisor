import { Artwork } from '../types'

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

interface MetObject {
  objectID: number
  title: string
  artistDisplayName: string
  artistDisplayBio: string
  objectDate: string
  medium: string
  primaryImage: string
  primaryImageSmall: string
  department: string
  culture: string
  classification: string
  objectURL: string
  dimensions: string
  creditLine: string
}

interface MetSearchResponse {
  total: number
  objectIDs: number[]
}

// Search terms to get diverse, high-quality art
const SEARCH_QUERIES = [
  'painting',
  'impressionism',
  'modern art',
  'portrait',
  'landscape',
  'sculpture',
  'abstract',
  'renaissance',
]

export async function searchMetArtworks(query: string): Promise<number[]> {
  const response = await fetch(
    `${MET_API_BASE}/search?hasImages=true&q=${encodeURIComponent(query)}`
  )
  if (!response.ok) return []

  const data: MetSearchResponse = await response.json()
  return data.objectIDs || []
}

export async function getMetObject(objectId: number): Promise<Artwork | null> {
  try {
    const response = await fetch(`${MET_API_BASE}/objects/${objectId}`)
    if (!response.ok) return null

    const data: MetObject = await response.json()

    // Skip items without images or key metadata
    if (!data.primaryImage || !data.title) return null

    // Build a description from available metadata
    const descParts: string[] = []
    if (data.artistDisplayBio) {
      descParts.push(data.artistDisplayBio)
    }
    if (data.culture && data.culture !== data.department) {
      descParts.push(`This ${data.classification || 'work'} represents ${data.culture} artistic traditions.`)
    }
    if (data.department) {
      descParts.push(`Part of the Met's ${data.department} collection.`)
    }

    return {
      id: `met-${data.objectID}`,
      title: data.title,
      artist: data.artistDisplayName || 'Unknown Artist',
      year: data.objectDate || 'Date unknown',
      medium: data.medium || 'Unknown medium',
      imageUrl: data.primaryImage,
      thumbnailUrl: data.primaryImageSmall || data.primaryImage,
      source: 'met',
      sourceUrl: data.objectURL,
      department: data.department,
      culture: data.culture,
      classification: data.classification,
      description: descParts.length > 0 ? descParts.join(' ') : undefined,
      dimensions: data.dimensions,
      creditLine: data.creditLine,
    }
  } catch {
    return null
  }
}

export async function fetchMetArtworks(count: number = 30): Promise<Artwork[]> {
  const artworks: Artwork[] = []
  const seenIds = new Set<number>()

  // Get IDs from multiple search queries for variety
  const allIds: number[] = []
  for (const query of SEARCH_QUERIES) {
    const ids = await searchMetArtworks(query)
    allIds.push(...ids.slice(0, 100)) // Take first 100 from each query
  }

  // Shuffle and deduplicate
  const shuffled = [...new Set(allIds)].sort(() => Math.random() - 0.5)

  // Fetch objects until we have enough
  for (const id of shuffled) {
    if (artworks.length >= count) break
    if (seenIds.has(id)) continue
    seenIds.add(id)

    const artwork = await getMetObject(id)
    if (artwork) {
      artworks.push(artwork)
    }
  }

  return artworks
}
