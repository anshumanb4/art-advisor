'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Artwork } from '@/lib/types'

export async function addToCollectionDB(artwork: Artwork) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.collectionItem.upsert({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId: artwork.id,
        },
      },
      create: {
        userId: session.user.id,
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
      },
      update: {},
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding to collection:', error)
    return { error: 'Failed to add to collection' }
  }
}

export async function getCollectionDB() {
  const session = await auth()
  if (!session?.user?.id) {
    return { artworks: [], addedAt: {} }
  }

  try {
    const items = await prisma.collectionItem.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' },
    })

    return {
      artworks: items.map((item) => ({
        id: item.artworkId,
        title: item.title,
        artist: item.artist,
        year: item.year,
        medium: item.medium,
        imageUrl: item.imageUrl,
        thumbnailUrl: item.thumbnailUrl,
        source: item.source as 'met' | 'artic',
        sourceUrl: item.sourceUrl,
        department: item.department ?? undefined,
        culture: item.culture ?? undefined,
      })),
      addedAt: Object.fromEntries(
        items.map((item) => [item.artworkId, item.addedAt.getTime()])
      ),
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    return { artworks: [], addedAt: {} }
  }
}

export async function removeFromCollectionDB(artworkId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.collectionItem.delete({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing from collection:', error)
    return { error: 'Failed to remove from collection' }
  }
}

export async function clearCollectionDB() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.collectionItem.deleteMany({
      where: { userId: session.user.id },
    })

    return { success: true }
  } catch (error) {
    console.error('Error clearing collection:', error)
    return { error: 'Failed to clear collection' }
  }
}
