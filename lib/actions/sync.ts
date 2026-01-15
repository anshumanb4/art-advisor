'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Collection, TasteProfile, SwipeEvent } from '@/lib/types'

interface SyncData {
  collection: Collection
  tasteProfile: TasteProfile | null
  swipeHistory: SwipeEvent[]
}

export async function syncLocalDataToServer(localData: SyncData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const userId = session.user.id

  try {
    // Get existing artwork IDs to avoid duplicates
    const existingItems = await prisma.collectionItem.findMany({
      where: { userId },
      select: { artworkId: true },
    })
    const existingArtworkIds = new Set(existingItems.map((item) => item.artworkId))

    // Filter new items
    const newItems = localData.collection.artworks.filter(
      (artwork) => !existingArtworkIds.has(artwork.id)
    )

    // Insert new collection items
    if (newItems.length > 0) {
      await prisma.collectionItem.createMany({
        data: newItems.map((artwork) => ({
          userId,
          artworkId: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          medium: artwork.medium,
          imageUrl: artwork.imageUrl,
          thumbnailUrl: artwork.thumbnailUrl,
          source: artwork.source,
          sourceUrl: artwork.sourceUrl,
          department: artwork.department,
          culture: artwork.culture,
          addedAt: new Date(localData.collection.addedAt[artwork.id] || Date.now()),
        })),
        skipDuplicates: true,
      })
    }

    // Sync taste profile if exists
    if (localData.tasteProfile) {
      await prisma.tasteProfile.upsert({
        where: { userId },
        create: {
          userId,
          preferredMediums: localData.tasteProfile.preferredMediums,
          preferredDepartments: localData.tasteProfile.preferredDepartments,
          preferredCultures: localData.tasteProfile.preferredCultures,
          favoriteArtists: localData.tasteProfile.favoriteArtists,
          totalLiked: localData.tasteProfile.totalLiked,
          totalSwiped: localData.tasteProfile.totalSwiped,
          summary: localData.tasteProfile.summary,
          lastUpdated: new Date(localData.tasteProfile.lastUpdated),
        },
        update: {
          preferredMediums: localData.tasteProfile.preferredMediums,
          preferredDepartments: localData.tasteProfile.preferredDepartments,
          preferredCultures: localData.tasteProfile.preferredCultures,
          favoriteArtists: localData.tasteProfile.favoriteArtists,
          totalLiked: localData.tasteProfile.totalLiked,
          totalSwiped: localData.tasteProfile.totalSwiped,
          summary: localData.tasteProfile.summary,
          lastUpdated: new Date(localData.tasteProfile.lastUpdated),
        },
      })
    }

    // Sync swipe history (limited batch to avoid large inserts)
    if (localData.swipeHistory.length > 0) {
      const recentSwipes = localData.swipeHistory.slice(-100) // Only sync last 100
      await prisma.swipeEvent.createMany({
        data: recentSwipes.map((event) => ({
          userId,
          artworkId: event.artworkId,
          liked: event.liked,
          timestamp: new Date(event.timestamp),
          sessionId: event.sessionId,
        })),
        skipDuplicates: true,
      })
    }

    return {
      success: true,
      merged: {
        collectionItems: newItems.length,
      },
    }
  } catch (error) {
    console.error('Error syncing data:', error)
    return { error: 'Failed to sync data' }
  }
}
