import { Artwork } from '../types'

const SMITHSONIAN_API_BASE = 'https://api.si.edu/openaccess/api/v1.0'

interface SmithsonianMedia {
  content: string
  thumbnail: string
}

interface SmithsonianContent {
  descriptiveNonRepeating: {
    title: { content: string }
    unit_code: string
    record_link: string
  }
  indexedStructured: {
    date?: string[]
    name?: string[]
    culture?: string[]
    object_type?: string[]
    topic?: string[]
  }
  freetext?: {
    physicalDescription?: { content: string }[]
    name?: { content: string }[]
    creditLine?: { content: string }[]
    notes?: { content: string }[]
  }
}

interface SmithsonianRecord {
  id: string
  title: string
  content: SmithsonianContent
  hash: string
}

interface SmithsonianResponse {
  response: {
    rows: {
      id: string
      title: string
      unitCode: string
      content: SmithsonianContent
      hash: string
    }[]
    rowCount: number
  }
}

const SEARCH_QUERIES = [
  'painting art',
  'portrait',
  'landscape',
  'sculpture',
  'american art',
  'photograph',
  'asian art',
  'modern art',
]

// Map unit codes to museum names
const UNIT_NAMES: Record<string, string> = {
  SAAM: 'Smithsonian American Art Museum',
  NPG: 'National Portrait Gallery',
  HMSG: 'Hirshhorn Museum',
  FSG: 'Freer Gallery of Art',
  ACM: 'Anacostia Community Museum',
  NMAAHC: 'National Museum of African American History and Culture',
  CHNDM: 'Cooper Hewitt',
}

function extractImageUrl(record: SmithsonianResponse['response']['rows'][0]): string | null {
  // Smithsonian images are accessed via IIIF or direct media URLs
  // The hash can be used to construct image URLs
  if (record.hash) {
    return `https://ids.si.edu/ids/deliveryService?id=${record.hash}`
  }
  return null
}

export async function fetchSmithsonianArtworks(count: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.SMITHSONIAN_API_KEY
  if (!apiKey) {
    console.warn('SMITHSONIAN_API_KEY not set, skipping Smithsonian')
    return []
  }

  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    // Focus on art museums
    const response = await fetch(
      `${SMITHSONIAN_API_BASE}/category/art_design/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&rows=${count}&start=${Math.floor(Math.random() * 100)}`
    )

    if (!response.ok) return artworks

    const data: SmithsonianResponse = await response.json()

    for (const item of data.response.rows) {
      const imageUrl = extractImageUrl(item)
      if (!imageUrl) continue

      const content = item.content
      const artist = content.indexedStructured?.name?.[0] ||
                     content.freetext?.name?.[0]?.content ||
                     'Unknown Artist'

      const year = content.indexedStructured?.date?.[0] || 'Date unknown'
      const medium = content.freetext?.physicalDescription?.[0]?.content || 'Unknown medium'
      const unitName = UNIT_NAMES[item.unitCode] || 'Smithsonian'

      artworks.push({
        id: `smithsonian-${item.id}`,
        title: item.title || content.descriptiveNonRepeating?.title?.content || 'Untitled',
        artist,
        year,
        medium,
        imageUrl,
        thumbnailUrl: imageUrl,
        source: 'smithsonian',
        sourceUrl: content.descriptiveNonRepeating?.record_link || `https://www.si.edu/object/${item.id}`,
        department: unitName,
        culture: content.indexedStructured?.culture?.[0] || undefined,
        classification: content.indexedStructured?.object_type?.[0] || undefined,
        description: content.freetext?.notes?.[0]?.content || undefined,
        creditLine: content.freetext?.creditLine?.[0]?.content || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Smithsonian:', error)
  }

  return artworks
}

export async function searchSmithsonianArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.SMITHSONIAN_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      `${SMITHSONIAN_API_BASE}/category/art_design/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&rows=${limit}`
    )

    if (!response.ok) return []

    const data: SmithsonianResponse = await response.json()

    const artworks: Artwork[] = []
    for (const item of data.response.rows) {
      const imageUrl = extractImageUrl(item)
      if (!imageUrl) continue

      const content = item.content
      artworks.push({
        id: `smithsonian-${item.id}`,
        title: item.title || 'Untitled',
        artist: content.indexedStructured?.name?.[0] || 'Unknown Artist',
        year: content.indexedStructured?.date?.[0] || 'Date unknown',
        medium: content.freetext?.physicalDescription?.[0]?.content || 'Unknown medium',
        imageUrl,
        thumbnailUrl: imageUrl,
        source: 'smithsonian',
        sourceUrl: content.descriptiveNonRepeating?.record_link || `https://www.si.edu/object/${item.id}`,
        department: UNIT_NAMES[item.unitCode] || 'Smithsonian',
        culture: content.indexedStructured?.culture?.[0] || undefined,
        classification: content.indexedStructured?.object_type?.[0] || undefined,
      })
    }
    return artworks
  } catch {
    return []
  }
}
