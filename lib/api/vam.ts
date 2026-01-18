import { Artwork } from '../types'

const VAM_API_BASE = 'https://api.vam.ac.uk/v2'

interface VAMImage {
  _primary_thumbnail?: string
  _iiif_image_base_url?: string
}

interface VAMRecord {
  systemNumber: string
  accessionNumber: string
  objectType: string
  _primaryTitle: string
  _primaryMaker?: { name: string }
  _primaryDate?: string
  _primaryPlace?: string
  _primaryImageId?: string
  _images?: VAMImage
  physicalDescription?: string
  materialsAndTechniques?: string
  creditLine?: string
}

interface VAMResponse {
  info: {
    record_count: number
    pages: number
  }
  records: VAMRecord[]
}

const SEARCH_QUERIES = [
  'painting',
  'sculpture',
  'portrait',
  'landscape',
  'textile',
  'ceramic',
  'photograph',
  'print',
]

function buildImageUrl(record: VAMRecord): string | null {
  // Use IIIF base URL to construct a medium-sized image
  if (record._images?._iiif_image_base_url) {
    return `${record._images._iiif_image_base_url}full/!800,800/0/default.jpg`
  }
  // Fallback to thumbnail
  if (record._images?._primary_thumbnail) {
    return record._images._primary_thumbnail.replace('!100,100', '!800,800')
  }
  // Try constructing from primaryImageId
  if (record._primaryImageId) {
    return `https://framemark.vam.ac.uk/collections/${record._primaryImageId}/full/!800,800/0/default.jpg`
  }
  return null
}

export async function fetchVAMArtworks(count: number = 20): Promise<Artwork[]> {
  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    const response = await fetch(
      `${VAM_API_BASE}/objects/search?q=${encodeURIComponent(query)}&images_exist=true&page_size=${count}&page=${Math.floor(Math.random() * 50) + 1}`
    )

    if (!response.ok) return artworks

    const data: VAMResponse = await response.json()

    for (const item of data.records) {
      const imageUrl = buildImageUrl(item)
      if (!imageUrl) continue

      artworks.push({
        id: `vam-${item.systemNumber}`,
        title: item._primaryTitle || 'Untitled',
        artist: item._primaryMaker?.name || 'Unknown Artist',
        year: item._primaryDate || 'Date unknown',
        medium: item.materialsAndTechniques || 'Unknown medium',
        imageUrl,
        thumbnailUrl: item._images?._primary_thumbnail || imageUrl,
        source: 'vam',
        sourceUrl: `https://collections.vam.ac.uk/item/${item.systemNumber}`,
        department: item.objectType || undefined,
        culture: item._primaryPlace || undefined,
        description: item.physicalDescription || undefined,
        creditLine: item.creditLine || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from V&A Museum:', error)
  }

  return artworks
}

export async function searchVAMArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  try {
    const response = await fetch(
      `${VAM_API_BASE}/objects/search?q=${encodeURIComponent(query)}&images_exist=true&page_size=${limit}`
    )

    if (!response.ok) return []

    const data: VAMResponse = await response.json()

    const artworks: Artwork[] = []
    for (const item of data.records) {
      const imageUrl = buildImageUrl(item)
      if (!imageUrl) continue

      artworks.push({
        id: `vam-${item.systemNumber}`,
        title: item._primaryTitle || 'Untitled',
        artist: item._primaryMaker?.name || 'Unknown Artist',
        year: item._primaryDate || 'Date unknown',
        medium: item.materialsAndTechniques || 'Unknown medium',
        imageUrl,
        thumbnailUrl: item._images?._primary_thumbnail || imageUrl,
        source: 'vam',
        sourceUrl: `https://collections.vam.ac.uk/item/${item.systemNumber}`,
        department: item.objectType || undefined,
        culture: item._primaryPlace || undefined,
      })
    }
    return artworks
  } catch {
    return []
  }
}
