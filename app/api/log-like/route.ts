import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { logArtworkLike } from '@/lib/sheets'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { artworkId, artworkTitle, sourceUrl, anonymousId } = body

    if (!artworkId || !artworkTitle || !sourceUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user email if signed in, otherwise use anonymous ID
    const session = await auth()
    const userIdentifier = session?.user?.email || anonymousId || 'anonymous'

    // Log to Google Sheet
    await logArtworkLike(userIdentifier, artworkId, artworkTitle, sourceUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging like:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
