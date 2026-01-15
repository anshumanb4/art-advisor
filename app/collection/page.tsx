'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Artwork } from '@/lib/types'
import { getCollection, removeFromCollection, clearAllData } from '@/lib/storage'

export default function CollectionPage() {
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    const collection = getCollection()
    // Sort by most recently added
    const sorted = [...collection.artworks].sort((a, b) => {
      const aTime = collection.addedAt[a.id] || 0
      const bTime = collection.addedAt[b.id] || 0
      return bTime - aTime
    })
    setArtworks(sorted)
  }, [])

  const handleRemove = (artworkId: string) => {
    removeFromCollection(artworkId)
    setArtworks(prev => prev.filter(a => a.id !== artworkId))
    setSelectedArtwork(null)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire collection?')) {
      clearAllData()
      setArtworks([])
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-200 transition-colors"
            aria-label="Back to home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold">My Collection</h1>
          {artworks.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {artworks.length === 0 ? (
          // Empty state
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🖼️</div>
            <h2 className="text-xl font-semibold">No artworks yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Start exploring to build your personal art collection
            </p>
            <Link
              href="/discover"
              className="inline-block mt-4 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">
              {artworks.length} {artworks.length === 1 ? 'piece' : 'pieces'} in your collection
            </p>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {artworks.map((artwork) => (
                <button
                  key={artwork.id}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="aspect-square relative rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 hover:ring-2 hover:ring-neutral-400 dark:hover:ring-neutral-600 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.thumbnailUrl || artwork.imageUrl}
                    alt={artwork.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-xs font-medium line-clamp-2">
                      {artwork.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedArtwork.title}</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedArtwork.artist}
                </p>
                <p className="text-sm text-neutral-500">
                  {selectedArtwork.year}
                </p>
              </div>

              {selectedArtwork.medium && selectedArtwork.medium !== 'Unknown medium' && (
                <p className="text-sm text-neutral-500">
                  {selectedArtwork.medium}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <a
                  href={selectedArtwork.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium text-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-sm"
                >
                  View Source
                </a>
                <button
                  onClick={() => handleRemove(selectedArtwork.id)}
                  className="py-3 px-4 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
