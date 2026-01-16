import { Artwork } from '../types'

const HARVARD_API_BASE = 'https://api.harvardartmuseums.org'

interface HarvardObject {
  objectnumber: string
  objectid: number
  title: string
  dated: string
  medium: string
  culture: string
  department: string
  classification: string
  creditline: string
  description: string | null
  dimensions: string
  primaryimageurl: string | null
  people: { name: string; role: string }[]
  url: string
}

interface HarvardResponse {
  info: {
    totalrecords: number
    pages: number
  }
  records: HarvardObject[]
}

const SEARCH_QUERIES = [
  'painting',
  'sculpture',
  'photograph',
  'print',
  'asian',
  'european',
  'american',
  'ancient',
]

export async function fetchHarvardArtworks(count: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.HARVARD_API_KEY
  if (!apiKey) {
    console.warn('HARVARD_API_KEY not set, skipping Harvard Art Museums')
    return []
  }

  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    const response = await fetch(
      `${HARVARD_API_BASE}/object?apikey=${apiKey}&q=${encodeURIComponent(query)}&hasimage=1&size=${count}&page=${Math.floor(Math.random() * 10) + 1}&sort=random`
    )

    if (!response.ok) return artworks

    const data: HarvardResponse = await response.json()

    for (const item of data.records) {
      if (!item.primaryimageurl) continue

      const artist = item.people?.find(p => p.role === 'Artist')?.name ||
                     item.people?.[0]?.name ||
                     'Unknown Artist'

      artworks.push({
        id: `harvard-${item.objectid}`,
        title: item.title || 'Untitled',
        artist,
        year: item.dated || 'Date unknown',
        medium: item.medium || 'Unknown medium',
        imageUrl: item.primaryimageurl,
        thumbnailUrl: item.primaryimageurl.replace('full/full', 'full/400,'),
        source: 'harvard',
        sourceUrl: item.url || `https://harvardartmuseums.org/collections/object/${item.objectid}`,
        department: item.department || undefined,
        culture: item.culture || undefined,
        classification: item.classification || undefined,
        description: item.description || undefined,
        dimensions: item.dimensions || undefined,
        creditLine: item.creditline || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Harvard Art Museums:', error)
  }

  return artworks
}

export async function searchHarvardArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.HARVARD_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      `${HARVARD_API_BASE}/object?apikey=${apiKey}&q=${encodeURIComponent(query)}&hasimage=1&size=${limit}`
    )

    if (!response.ok) return []

    const data: HarvardResponse = await response.json()

    return data.records
      .filter(item => item.primaryimageurl)
      .map(item => ({
        id: `harvard-${item.objectid}`,
        title: item.title || 'Untitled',
        artist: item.people?.find(p => p.role === 'Artist')?.name || item.people?.[0]?.name || 'Unknown Artist',
        year: item.dated || 'Date unknown',
        medium: item.medium || 'Unknown medium',
        imageUrl: item.primaryimageurl!,
        thumbnailUrl: item.primaryimageurl!.replace('full/full', 'full/400,'),
        source: 'harvard' as const,
        sourceUrl: item.url || `https://harvardartmuseums.org/collections/object/${item.objectid}`,
        department: item.department || undefined,
        culture: item.culture || undefined,
        classification: item.classification || undefined,
        description: item.description || undefined,
        dimensions: item.dimensions || undefined,
        creditLine: item.creditline || undefined,
      }))
  } catch {
    return []
  }
}
