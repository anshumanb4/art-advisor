'use client'

import { useEffect, useState } from 'react'
import { Artwork } from '@/lib/types'

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

// Safely convert any value to a displayable string
function toDisplayString(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    // Handle objects like {unframed: "...", framed: "..."}
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v && typeof v === 'string')
      .map(([k, v]) => `${k}: ${v}`)
    return entries.length > 0 ? entries.join('; ') : null
  }
  return String(value)
}

interface InfoModalProps {
  artwork: Artwork
  onClose: () => void
}

interface ArtworkInfo {
  summary: string | null
  source?: string
  message?: string
}

export default function InfoModal({ artwork, onClose }: InfoModalProps) {
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  useEffect(() => {
    async function fetchArtworkInfo() {
      setLoadingInfo(true)
      try {
        const params = new URLSearchParams({
          title: artwork.title,
          artist: artwork.artist,
        })
        const response = await fetch(`/api/artwork-info?${params}`)
        if (response.ok) {
          const data = await response.json()
          setArtworkInfo(data)
        }
      } catch {
        // Silently fail - we'll just not show the section
      } finally {
        setLoadingInfo(false)
      }
    }

    fetchArtworkInfo()
  }, [artwork.title, artwork.artist])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">About This Artwork</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-60px)]">
          {/* Title & Artist */}
          <div>
            <h3 className="text-xl font-semibold leading-tight">{artwork.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {artwork.artist}
            </p>
            <p className="text-sm text-neutral-500 mt-0.5">
              {artwork.year}
            </p>
          </div>

          {/* Description */}
          {artwork.description ? (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                Description
              </h4>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {artwork.description}
              </p>
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                No detailed description available for this artwork. Visit the museum&apos;s website for more information.
              </p>
            </div>
          )}

          {/* Story / Additional Info */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
              The Story Behind the Work
            </h4>
            {loadingInfo ? (
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin" />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Searching for more information...
                </p>
              </div>
            ) : artworkInfo?.summary ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                  {artworkInfo.summary}
                </p>
                {artworkInfo.source && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Source: {artworkInfo.source}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {artworkInfo?.message || 'No additional story information available for this artwork.'}
                </p>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            {artwork.medium && artwork.medium !== 'Unknown medium' && (
              <div>
                <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Medium
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {artwork.medium}
                </p>
              </div>
            )}

            {toDisplayString(artwork.dimensions) && (
              <div>
                <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Dimensions
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {toDisplayString(artwork.dimensions)}
                </p>
              </div>
            )}

            {toDisplayString(artwork.classification) && (
              <div>
                <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Classification
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {toDisplayString(artwork.classification)}
                </p>
              </div>
            )}

            {toDisplayString(artwork.culture) && (
              <div>
                <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Origin
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {toDisplayString(artwork.culture)}
                </p>
              </div>
            )}

            {toDisplayString(artwork.department) && (
              <div>
                <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Department
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {toDisplayString(artwork.department)}
                </p>
              </div>
            )}
          </div>

          {/* Credit line */}
          {toDisplayString(artwork.creditLine) && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {toDisplayString(artwork.creditLine)}
              </p>
            </div>
          )}

          {/* Source link */}
          <a
            href={artwork.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium text-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            View on {getSourceName(artwork.source)}
          </a>
        </div>
      </div>

    </div>
  )
}
