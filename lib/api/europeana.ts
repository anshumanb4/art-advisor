import { Artwork } from '../types'

const EUROPEANA_API_BASE = 'https://api.europeana.eu/record/v2'

interface EuropeanaItem {
  id: string
  title?: string[]
  dcCreator?: string[]
  dcCreatorLangAware?: { [key: string]: string[] }
  year?: string[]
  dcDescription?: string[]
  edmPreview?: string[]
  edmIsShownAt?: string[]
  edmIsShownBy?: string[]
  dataProvider?: string[]
  dctermsExtent?: string[]
  dcFormat?: string[]
  dcType?: string[]
  country?: string[]
}

interface EuropeanaResponse {
  success: boolean
  itemsCount: number
  totalResults: number
  items?: EuropeanaItem[]
}

const SEARCH_QUERIES = [
  'painting',
  'portrait',
  'landscape',
  'sculpture',
  'impressionism',
  'renaissance',
  'baroque',
  'photograph',
]

function getImageUrl(item: EuropeanaItem): string | null {
  // Try edmIsShownBy first (usually higher res)
  if (item.edmIsShownBy?.[0]) {
    return item.edmIsShownBy[0]
  }
  // Fall back to preview
  if (item.edmPreview?.[0]) {
    return item.edmPreview[0]
  }
  return null
}

function getArtist(item: EuropeanaItem): string {
  if (item.dcCreator?.[0]) {
    return item.dcCreator[0]
  }
  // Try language-aware creator
  if (item.dcCreatorLangAware) {
    const langs = Object.keys(item.dcCreatorLangAware)
    if (langs.length > 0 && item.dcCreatorLangAware[langs[0]]?.[0]) {
      return item.dcCreatorLangAware[langs[0]][0]
    }
  }
  return 'Unknown Artist'
}

export async function fetchEuropeanaArtworks(count: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.EUROPEANA_API_KEY
  if (!apiKey) {
    console.warn('EUROPEANA_API_KEY not set, skipping Europeana')
    return []
  }

  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    // Search for artworks with images, filter by TYPE:IMAGE for visual art
    const response = await fetch(
      `${EUROPEANA_API_BASE}/search.json?wskey=${apiKey}&query=${encodeURIComponent(query)}&qf=TYPE:IMAGE&qf=MEDIA:true&rows=${count}&start=${Math.floor(Math.random() * 100) + 1}&profile=rich`
    )

    if (!response.ok) return artworks

    const data: EuropeanaResponse = await response.json()

    if (!data.items) return artworks

    for (const item of data.items) {
      const imageUrl = getImageUrl(item)
      if (!imageUrl) continue

      artworks.push({
        id: `europeana-${item.id.replace(/\//g, '-')}`,
        title: item.title?.[0] || 'Untitled',
        artist: getArtist(item),
        year: item.year?.[0] || 'Date unknown',
        medium: item.dcFormat?.[0] || item.dcType?.[0] || 'Unknown medium',
        imageUrl,
        thumbnailUrl: item.edmPreview?.[0] || imageUrl,
        source: 'europeana',
        sourceUrl: item.edmIsShownAt?.[0] || `https://www.europeana.eu/item${item.id}`,
        department: item.dataProvider?.[0] || undefined,
        culture: item.country?.[0] || undefined,
        description: item.dcDescription?.[0] || undefined,
        dimensions: item.dctermsExtent?.[0] || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Europeana:', error)
  }

  return artworks
}

export async function searchEuropeanaArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  const apiKey = process.env.EUROPEANA_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      `${EUROPEANA_API_BASE}/search.json?wskey=${apiKey}&query=${encodeURIComponent(query)}&qf=TYPE:IMAGE&qf=MEDIA:true&rows=${limit}&profile=rich`
    )

    if (!response.ok) return []

    const data: EuropeanaResponse = await response.json()

    if (!data.items) return []

    return data.items
      .map(item => {
        const imageUrl = getImageUrl(item)
        if (!imageUrl) return null

        return {
          id: `europeana-${item.id.replace(/\//g, '-')}`,
          title: item.title?.[0] || 'Untitled',
          artist: getArtist(item),
          year: item.year?.[0] || 'Date unknown',
          medium: item.dcFormat?.[0] || 'Unknown medium',
          imageUrl,
          thumbnailUrl: item.edmPreview?.[0] || imageUrl,
          source: 'europeana' as const,
          sourceUrl: item.edmIsShownAt?.[0] || `https://www.europeana.eu/item${item.id}`,
          department: item.dataProvider?.[0] || undefined,
          culture: item.country?.[0] || undefined,
        }
      })
      .filter((item): item is Artwork => item !== null)
  } catch {
    return []
  }
}
