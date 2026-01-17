'use client'

import { Artwork } from '@/lib/types'
import { useState } from 'react'

interface ArtCardProps {
  artwork: Artwork
  priority?: boolean
}

function getSourceName(source: string): string {
  const names: Record<string, string> = {
    met: 'Met Museum',
    artic: 'Art Institute Chicago',
    cleveland: 'Cleveland Museum',
    rijks: 'Rijksmuseum',
    harvard: 'Harvard Art Museums',
    smithsonian: 'Smithsonian',
  }
  return names[source] || source
}

export default function ArtCard({ artwork, priority = false }: ArtCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative w-full h-full bg-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Loading spinner - only shows while loading */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-neutral-600 border-t-neutral-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-neutral-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* The actual image */}
      {!imageError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Info bar at bottom */}
      <div className="absolute inset-x-0 bottom-0 bg-black p-4 text-white z-20">
        <h2 className="text-lg font-semibold leading-tight mb-0.5 line-clamp-1">
          {artwork.title}
        </h2>
        <p className="text-white/90 text-sm">
          {artwork.artist} • {artwork.year}
        </p>
      </div>

      {/* Source badge - top right */}
      <div className="absolute top-4 right-4 z-30">
        <span className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-700 rounded-full shadow-sm border border-neutral-200">
          {getSourceName(artwork.source)}
        </span>
      </div>
    </div>
  )
}
