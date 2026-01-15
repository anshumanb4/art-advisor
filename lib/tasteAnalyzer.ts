import { Artwork, TasteProfile } from './types'

interface Counter {
  [key: string]: number
}

function countOccurrences(items: (string | undefined)[]): { name: string; count: number }[] {
  const counter: Counter = {}

  for (const item of items) {
    if (item && item !== 'Unknown' && item !== 'Unknown Artist' && item !== 'Date unknown') {
      counter[item] = (counter[item] || 0) + 1
    }
  }

  return Object.entries(counter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

function extractMediumCategory(medium: string): string {
  const lowerMedium = medium.toLowerCase()

  if (lowerMedium.includes('oil') || lowerMedium.includes('canvas')) {
    return 'Oil Painting'
  }
  if (lowerMedium.includes('watercolor') || lowerMedium.includes('gouache')) {
    return 'Watercolor'
  }
  if (lowerMedium.includes('print') || lowerMedium.includes('lithograph') || lowerMedium.includes('etching')) {
    return 'Prints & Engravings'
  }
  if (lowerMedium.includes('sculpture') || lowerMedium.includes('bronze') || lowerMedium.includes('marble')) {
    return 'Sculpture'
  }
  if (lowerMedium.includes('photograph') || lowerMedium.includes('photo')) {
    return 'Photography'
  }
  if (lowerMedium.includes('drawing') || lowerMedium.includes('pencil') || lowerMedium.includes('charcoal')) {
    return 'Drawing'
  }
  if (lowerMedium.includes('ceramic') || lowerMedium.includes('porcelain')) {
    return 'Ceramics'
  }
  if (lowerMedium.includes('textile') || lowerMedium.includes('tapestry')) {
    return 'Textiles'
  }

  return 'Mixed Media'
}

function generateSummaryText(
  likedArtworks: Artwork[],
  mediums: { name: string; count: number }[],
  departments: { name: string; count: number }[],
  cultures: { name: string; count: number }[],
  favoriteArtists: string[]
): string {
  if (likedArtworks.length < 3) {
    return 'Like more artworks to discover your taste profile!'
  }

  const parts: string[] = []

  // Opening
  parts.push(`Based on your ${likedArtworks.length} liked artworks, `)

  // Medium preferences
  if (mediums.length > 0) {
    const topMediums = mediums.slice(0, 2).map(m => m.name)
    if (topMediums.length === 1) {
      parts.push(`you show a strong preference for ${topMediums[0]}. `)
    } else {
      parts.push(`you gravitate toward ${topMediums.join(' and ')}. `)
    }
  }

  // Department/category preferences
  if (departments.length > 0 && departments[0].count >= 2) {
    parts.push(`You're particularly drawn to works from ${departments[0].name}. `)
  }

  // Cultural preferences
  if (cultures.length > 0 && cultures[0].count >= 2) {
    parts.push(`${cultures[0].name} art resonates with you. `)
  }

  // Favorite artists
  if (favoriteArtists.length > 0) {
    if (favoriteArtists.length === 1) {
      parts.push(`You've shown particular interest in work by ${favoriteArtists[0]}. `)
    } else if (favoriteArtists.length <= 3) {
      parts.push(`Artists like ${favoriteArtists.join(', ')} catch your eye. `)
    }
  }

  // Closing insight
  const insights = [
    'Your taste suggests an appreciation for craftsmanship and artistic expression.',
    'You seem to value both technique and emotional impact in art.',
    'Your selections reveal a thoughtful and discerning eye.',
    'Continue exploring to refine your understanding of what moves you.',
  ]
  parts.push(insights[Math.floor(Math.random() * insights.length)])

  return parts.join('')
}

export function analyzeTaste(
  likedArtworks: Artwork[],
  totalSwiped: number
): TasteProfile {
  // Extract and count patterns
  const mediumCategories = likedArtworks.map(a => extractMediumCategory(a.medium))
  const preferredMediums = countOccurrences(mediumCategories)

  const departments = likedArtworks.map(a => a.department)
  const preferredDepartments = countOccurrences(departments)

  const cultures = likedArtworks.map(a => a.culture)
  const preferredCultures = countOccurrences(cultures)

  // Find favorite artists (appeared more than once)
  const artistCounts = countOccurrences(
    likedArtworks.map(a => a.artist).filter(a => a !== 'Unknown Artist')
  )
  const favoriteArtists = artistCounts
    .filter(a => a.count >= 2)
    .slice(0, 5)
    .map(a => a.name)

  // Generate summary
  const summary = generateSummaryText(
    likedArtworks,
    preferredMediums,
    preferredDepartments,
    preferredCultures,
    favoriteArtists
  )

  return {
    preferredMediums: preferredMediums.slice(0, 5),
    preferredDepartments: preferredDepartments.slice(0, 5),
    preferredCultures: preferredCultures.slice(0, 5),
    favoriteArtists,
    totalLiked: likedArtworks.length,
    totalSwiped,
    summary,
    lastUpdated: Date.now(),
  }
}
