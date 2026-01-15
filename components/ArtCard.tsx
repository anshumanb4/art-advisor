'use client'

import { Artwork } from '@/lib/types'
import { useState } from 'react'

interface ArtCardProps {
  artwork: Artwork
  priority?: boolean
}

export default function ArtCard({ artwork, priority = false }: ArtCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Image container - pure white background, no grey */}
      <div className="absolute inset-0 bg-white">
        {!imageError ? (
          <>
            {/* Loading placeholder - white with subtle spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artwork.imageUrl}
              alt={`${artwork.title} by ${artwork.artist}`}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center text-neutral-500">
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
      </div>

      {/* Info bar at bottom - solid background */}
      <div className="absolute inset-x-0 bottom-0 bg-black p-4 text-white">
        <h2 className="text-lg font-semibold leading-tight mb-0.5 line-clamp-1">
          {artwork.title}
        </h2>
        <p className="text-white/90 text-sm">
          {artwork.artist} • {artwork.year}
        </p>
      </div>

      {/* Source badge - top right */}
      <div className="absolute top-4 right-4 z-50">
        <span className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-700 rounded-full shadow-sm border border-neutral-200">
          {artwork.source === 'met' ? 'Met Museum' : 'Art Institute Chicago'}
        </span>
      </div>
    </div>
  )
}
