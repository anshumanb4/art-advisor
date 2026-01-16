import { Artwork } from '../types'

const RIJKS_API_BASE = 'https://www.rijksmuseum.nl/api/en'

interface RijksWebImage {
  url: string
  width: number
  height: number
}

interface RijksArtObject {
  objectNumber: string
  title: string
  principalOrFirstMaker: string
  longTitle: string
  webImage: RijksWebImage | null
  headerImage: RijksWebImage | null
  links: {
    web: string
  }
}

interface RijksArtObjectDetail {
  objectNumber: string
  title: string
  principalOrFirstMaker: string
  dating: {
    presentingDate: string
  }
  physicalMedium: string
  subTitle: string
  scLabelLine: string
  label: {
    description: string
  } | null
  dimensions: { type: string; value: string }[]
  webImage: RijksWebImage | null
  classification: {
    iconClassDescription: string[]
  }
  acquisition: {
    creditLine: string
  }
}

interface RijksSearchResponse {
  artObjects: RijksArtObject[]
  count: number
}

interface RijksDetailResponse {
  artObject: RijksArtObjectDetail
}

const SEARCH_QUERIES = [
  'rembrandt',
  'vermeer',
  'van gogh',
  'landscape',
  'portrait',
  'still life',
  'night watch',
  'golden age',
]

export async function fetchRijksArtworks(count: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.NEXT_PUBLIC_RIJKS_API_KEY || process.env.RIJKS_API_KEY
  if (!apiKey) {
    console.warn('RIJKS_API_KEY not set, skipping Rijksmuseum')
    return []
  }

  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    const response = await fetch(
      `${RIJKS_API_BASE}/collection?key=${apiKey}&q=${encodeURIComponent(query)}&ps=${count}&p=${Math.floor(Math.random() * 10) + 1}&imgonly=True`
    )

    if (!response.ok) return artworks

    const data: RijksSearchResponse = await response.json()

    for (const item of data.artObjects) {
      if (!item.webImage?.url) continue

      artworks.push({
        id: `rijks-${item.objectNumber}`,
        title: item.title || 'Untitled',
        artist: item.principalOrFirstMaker || 'Unknown Artist',
        year: '', // Will be filled from detail if needed
        medium: 'Unknown medium',
        imageUrl: item.webImage.url,
        thumbnailUrl: item.headerImage?.url || item.webImage.url,
        source: 'rijks',
        sourceUrl: item.links.web || `https://www.rijksmuseum.nl/en/collection/${item.objectNumber}`,
        description: item.longTitle || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Rijksmuseum:', error)
  }

  return artworks
}

export async function getRijksArtworkDetail(objectNumber: string): Promise<Artwork | null> {
  const apiKey = process.env.NEXT_PUBLIC_RIJKS_API_KEY || process.env.RIJKS_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      `${RIJKS_API_BASE}/collection/${objectNumber}?key=${apiKey}`
    )

    if (!response.ok) return null

    const data: RijksDetailResponse = await response.json()
    const item = data.artObject

    if (!item.webImage?.url) return null

    return {
      id: `rijks-${item.objectNumber}`,
      title: item.title || 'Untitled',
      artist: item.principalOrFirstMaker || 'Unknown Artist',
      year: item.dating?.presentingDate || 'Date unknown',
      medium: item.physicalMedium || 'Unknown medium',
      imageUrl: item.webImage.url,
      thumbnailUrl: item.webImage.url,
      source: 'rijks',
      sourceUrl: `https://www.rijksmuseum.nl/en/collection/${item.objectNumber}`,
      description: item.label?.description || item.scLabelLine || undefined,
      dimensions: item.dimensions?.map(d => `${d.type}: ${d.value}`).join(', ') || undefined,
      creditLine: item.acquisition?.creditLine || undefined,
      classification: item.classification?.iconClassDescription?.[0] || undefined,
    }
  } catch {
    return null
  }
}
