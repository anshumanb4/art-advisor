import { Artwork } from '../types'

const ARTIC_API_BASE = 'https://api.artic.edu/api/v1'
const ARTIC_IIIF_BASE = 'https://www.artic.edu/iiif/2'

interface ArticArtwork {
  id: number
  title: string
  artist_title: string | null
  artist_display: string | null
  date_display: string | null
  medium_display: string | null
  image_id: string | null
  department_title: string | null
  place_of_origin: string | null
  classification_title: string | null
  description: string | null
  short_description: string | null
  dimensions: string | null
  credit_line: string | null
}

interface ArticResponse {
  data: ArticArtwork[]
  pagination: {
    total: number
    total_pages: number
  }
}

function getArticImageUrl(imageId: string, size: number = 843): string {
  return `${ARTIC_IIIF_BASE}/${imageId}/full/${size},/0/default.jpg`
}

function stripHtml(html: string | null): string | undefined {
  if (!html) return undefined
  return html.replace(/<[^>]*>/g, '').trim() || undefined
}

function buildArticDescription(item: ArticArtwork): string | undefined {
  // Prefer short_description, then description, then build from metadata
  if (item.short_description) {
    return stripHtml(item.short_description)
  }
  if (item.description) {
    const stripped = stripHtml(item.description)
    // Truncate long descriptions
    if (stripped && stripped.length > 500) {
      return stripped.substring(0, 497) + '...'
    }
    return stripped
  }
  // Build from metadata
  const parts: string[] = []
  if (item.artist_display) {
    parts.push(item.artist_display)
  }
  if (item.place_of_origin) {
    parts.push(`Origin: ${item.place_of_origin}`)
  }
  if (item.department_title) {
    parts.push(`Part of the Art Institute's ${item.department_title} collection.`)
  }
  return parts.length > 0 ? parts.join('. ') : undefined
}

export async function fetchArticArtworks(
  count: number = 30,
  page: number = 1
): Promise<Artwork[]> {
  const artworks: Artwork[] = []
  const fields = [
    'id',
    'title',
    'artist_title',
    'artist_display',
    'date_display',
    'medium_display',
    'image_id',
    'department_title',
    'place_of_origin',
    'classification_title',
    'description',
    'short_description',
    'dimensions',
    'credit_line',
  ].join(',')

  try {
    // Fetch artworks with images, sorted randomly
    const response = await fetch(
      `${ARTIC_API_BASE}/artworks?fields=${fields}&limit=${count}&page=${page}&query[term][is_public_domain]=true`
    )

    if (!response.ok) return artworks

    const data: ArticResponse = await response.json()

    for (const item of data.data) {
      // Skip items without images
      if (!item.image_id) continue

      artworks.push({
        id: `artic-${item.id}`,
        title: item.title || 'Untitled',
        artist: item.artist_title || 'Unknown Artist',
        year: item.date_display || 'Date unknown',
        medium: item.medium_display || 'Unknown medium',
        imageUrl: getArticImageUrl(item.image_id, 843),
        thumbnailUrl: getArticImageUrl(item.image_id, 400),
        source: 'artic',
        sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
        department: item.department_title || undefined,
        culture: item.place_of_origin || undefined,
        classification: item.classification_title || undefined,
        description: buildArticDescription(item),
        dimensions: item.dimensions || undefined,
        creditLine: item.credit_line || undefined,
      })
    }
  } catch (error) {
    console.error('Error fetching from Art Institute of Chicago:', error)
  }

  return artworks
}

export async function searchArticArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  const fields = [
    'id',
    'title',
    'artist_title',
    'artist_display',
    'date_display',
    'medium_display',
    'image_id',
    'department_title',
    'place_of_origin',
    'classification_title',
    'description',
    'short_description',
    'dimensions',
    'credit_line',
  ].join(',')

  try {
    const response = await fetch(
      `${ARTIC_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&fields=${fields}&limit=${limit}`
    )

    if (!response.ok) return []

    const data: ArticResponse = await response.json()

    return data.data
      .filter(item => item.image_id)
      .map(item => ({
        id: `artic-${item.id}`,
        title: item.title || 'Untitled',
        artist: item.artist_title || 'Unknown Artist',
        year: item.date_display || 'Date unknown',
        medium: item.medium_display || 'Unknown medium',
        imageUrl: getArticImageUrl(item.image_id!, 843),
        thumbnailUrl: getArticImageUrl(item.image_id!, 400),
        source: 'artic' as const,
        sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
        department: item.department_title || undefined,
        culture: item.place_of_origin || undefined,
        classification: item.classification_title || undefined,
        description: buildArticDescription(item),
        dimensions: item.dimensions || undefined,
        creditLine: item.credit_line || undefined,
      }))
  } catch {
    return []
  }
}
