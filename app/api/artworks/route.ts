import { NextResponse } from 'next/server'
import { fetchArtworks, fetchMoreArtworks } from '@/lib/api/artworks'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const count = parseInt(searchParams.get('count') || '30')
  const existingIdsParam = searchParams.get('existingIds')

  try {
    if (existingIdsParam) {
      // Fetch more artworks, excluding existing ones
      const existingIds = new Set(existingIdsParam.split(','))
      const artworks = await fetchMoreArtworks(existingIds, count)
      return NextResponse.json({ artworks })
    } else {
      // Fetch initial artworks
      const artworks = await fetchArtworks(count)
      return NextResponse.json({ artworks })
    }
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}
