import { Artwork } from '../types'

const CMA_API_BASE = 'https://openaccess-api.clevelandart.org/api'

interface CMAImage {
  web?: {
    url: string
  }
  print?: {
    url: string
  }
}

interface CMACreator {
  description: string
}

interface CMAArtwork {
  id: number
  accession_number: string
  title: string
  creators: CMACreator[]
  creation_date: string
  technique: string
  department: string
  culture: string[]
  type: string
  description: string | null
  dimensions: string
  credit_line: string
  images: CMAImage
  url: string
}

interface CMAResponse {
  data: CMAArtwork[]
  info: {
    total: number
  }
}

const SEARCH_QUERIES = [
  'impressionism',
  'portrait',
  'landscape',
  'renaissance',
  'modern',
  'abstract',
  'sculpture',
]

export async function fetchClevelandArtworks(count: number = 20): Promise<Artwork[]> {
  const artworks: Artwork[] = []

  // Randomly select a query for variety
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    const response = await fetch(
      `${CMA_API_BASE}/artworks/?q=${encodeURIComponent(query)}&has_image=1&cc0=1&limit=${count}&skip=${Math.floor(Math.random() * 100)}`
    )

    if (!response.ok) return artworks

    const data: CMAResponse = await response.json()

    for (const item of data.data) {
      if (!item.images?.web?.url) continue

      const artist = item.creators?.[0]?.description || 'Unknown Artist'

      artworks.push({
        id: `cma-${item.id}`,
        title: item.title || 'Untitled',
        artist,
        year: item.creation_date || 'Date unknown',
        medium: item.technique || 'Unknown medium',
        imageUrl: item.images.web.url,
        thumbnailUrl: item.images.web.url,
        source: 'cleveland',
        sourceUrl: `https://www.clevelandart.org/art/${item.accession_number}`,
        department: item.department || undefined,
        culture: item.culture?.[0] || undefined,
        classification: item.type || undefined,
        description: item.description || undefined,
        dimensions: item.dimensions || undefined,
        creditLine: item.credit_line || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Cleveland Museum:', error)
  }

  return artworks
}

export async function searchClevelandArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  try {
    const response = await fetch(
      `${CMA_API_BASE}/artworks/?q=${encodeURIComponent(query)}&has_image=1&cc0=1&limit=${limit}`
    )

    if (!response.ok) return []

    const data: CMAResponse = await response.json()

    return data.data
      .filter(item => item.images?.web?.url)
      .map(item => ({
        id: `cma-${item.id}`,
        title: item.title || 'Untitled',
        artist: item.creators?.[0]?.description || 'Unknown Artist',
        year: item.creation_date || 'Date unknown',
        medium: item.technique || 'Unknown medium',
        imageUrl: item.images.web!.url,
        thumbnailUrl: item.images.web!.url,
        source: 'cleveland' as const,
        sourceUrl: `https://www.clevelandart.org/art/${item.accession_number}`,
        department: item.department || undefined,
        culture: item.culture?.[0] || undefined,
        classification: item.type || undefined,
        description: item.description || undefined,
        dimensions: item.dimensions || undefined,
        creditLine: item.credit_line || undefined,
      }))
  } catch {
    return []
  }
}
