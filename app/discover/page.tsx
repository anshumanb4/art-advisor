'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Artwork } from '@/lib/types'
import { fetchArtworks, fetchMoreArtworks } from '@/lib/api/artworks'
import { addToCollection, addSwipeEvent } from '@/lib/storage'
import { addToCollectionDB } from '@/lib/actions/collection'
import { analyzeTaste } from '@/lib/tasteAnalyzer'
import { saveTasteProfile } from '@/lib/storage'
import ArtCard from '@/components/ArtCard'
import SwipeableCard from '@/components/SwipeableCard'
import ActionButtons from '@/components/ActionButtons'
import LoadingSpinner from '@/components/LoadingSpinner'
import InfoModal from '@/components/InfoModal'
import FullscreenImage from '@/components/FullscreenImage'
import SignInModal from '@/components/SignInModal'

export default function DiscoverPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => Date.now().toString())
  const [anonymousId] = useState(() => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('art-advisor-anonymous-id')
    if (!id) {
      id = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('art-advisor-anonymous-id', id)
    }
    return id
  })
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [infoArtwork, setInfoArtwork] = useState<Artwork | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [hasDeclinedSignIn, setHasDeclinedSignIn] = useState(false)
  const [pendingLikeArtwork, setPendingLikeArtwork] = useState<Artwork | null>(null)

  // Fetch initial artworks
  useEffect(() => {
    async function loadArtworks() {
      try {
        setLoading(true)
        setError(null)
        const fetched = await fetchArtworks(30)
        if (fetched.length === 0) {
          setError('Unable to load artworks. Please try again.')
        } else {
          setArtworks(fetched)
          setSeenIds(new Set(fetched.map(a => a.id)))
        }
      } catch {
        setError('Failed to load artworks. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  // Fetch more artworks when running low
  useEffect(() => {
    async function loadMore() {
      if (artworks.length - currentIndex <= 5 && artworks.length > 0) {
        const more = await fetchMoreArtworks(seenIds, 20)
        if (more.length > 0) {
          setArtworks(prev => [...prev, ...more])
          setSeenIds(prev => {
            const newSet = new Set(prev)
            more.forEach(a => newSet.add(a.id))
            return newSet
          })
        }
      }
    }

    loadMore()
  }, [currentIndex, artworks.length, seenIds])

  const currentArtwork = artworks[currentIndex]

  const processLike = useCallback(async (artwork: Artwork) => {
    setLikedArtworks(prev => [...prev, artwork])

    if (session?.user) {
      // Save to database for authenticated users
      await addToCollectionDB(artwork)
    } else {
      // Save to localStorage for anonymous users
      addToCollection(artwork)
    }

    // Log to Google Sheet for analytics (fire and forget)
    fetch('/api/log-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        sourceUrl: artwork.sourceUrl,
        anonymousId,
      }),
    }).catch(() => {}) // Silently ignore errors
  }, [session, anonymousId])

  const handleSwipe = useCallback((liked: boolean) => {
    if (!currentArtwork) return

    // Record swipe event
    addSwipeEvent({
      artworkId: currentArtwork.id,
      liked,
      timestamp: Date.now(),
      sessionId,
    })

    if (liked) {
      // If not signed in and hasn't declined, show sign-in modal
      if (!session?.user && !hasDeclinedSignIn) {
        setPendingLikeArtwork(currentArtwork)
        setShowSignInModal(true)
        return
      }

      // Process the like
      processLike(currentArtwork)
    }

    // Move to next artwork
    setCurrentIndex(prev => prev + 1)
  }, [currentArtwork, sessionId, session, hasDeclinedSignIn, processLike])

  const handleContinueAnonymous = useCallback(() => {
    setHasDeclinedSignIn(true)
    setShowSignInModal(false)

    if (pendingLikeArtwork) {
      // Save to localStorage
      addToCollection(pendingLikeArtwork)
      setLikedArtworks(prev => [...prev, pendingLikeArtwork])

      // Log to Google Sheet for analytics
      fetch('/api/log-like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: pendingLikeArtwork.id,
          artworkTitle: pendingLikeArtwork.title,
          sourceUrl: pendingLikeArtwork.sourceUrl,
          anonymousId,
        }),
      }).catch(() => {})

      setPendingLikeArtwork(null)
      // Move to next artwork
      setCurrentIndex(prev => prev + 1)
    }
  }, [pendingLikeArtwork, anonymousId])

  const handleDone = useCallback(() => {
    // Generate and save taste profile
    const totalSwiped = currentIndex
    const profile = analyzeTaste(likedArtworks, totalSwiped)
    saveTasteProfile(profile)

    // Navigate to summary
    router.push('/summary')
  }, [currentIndex, likedArtworks, router])

  // Handle info button - capture current artwork immediately
  const handleInfoClick = useCallback(() => {
    if (currentArtwork) {
      setInfoArtwork(currentArtwork)
    }
  }, [currentArtwork])

  // Handle image tap for fullscreen
  const handleImageTap = useCallback(() => {
    if (currentArtwork) {
      setFullscreenImage({
        src: currentArtwork.imageUrl,
        alt: `${currentArtwork.title} by ${currentArtwork.artist}`,
      })
    }
  }, [currentArtwork])

  if (loading) {
    return <LoadingSpinner message="Curating artworks for you..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-900">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-neutral-900 rounded-xl font-medium"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!currentArtwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-900">
        <p className="text-neutral-400 mb-4">
          No more artworks to show
        </p>
        <button
          onClick={handleDone}
          className="px-6 py-3 bg-white text-neutral-900 rounded-xl font-medium"
        >
          View Results
        </button>
      </div>
    )
  }

  return (
    <main className="h-screen flex flex-col bg-neutral-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-neutral-700 transition-colors text-white"
          aria-label="Back to home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-neutral-400">
          {currentIndex + 1} viewed
        </span>
        <div className="w-10" />
      </header>

      {/* Card area - no preview card behind */}
      <div className="flex-1 relative px-4 pb-4">
        <div className="relative h-full">
          <SwipeableCard
            onSwipeLeft={() => handleSwipe(false)}
            onSwipeRight={() => handleSwipe(true)}
            onTap={handleImageTap}
          >
            <ArtCard
              artwork={currentArtwork}
              priority
            />
          </SwipeableCard>

          {/* Info button - OUTSIDE swipeable area */}
          <button
            onClick={handleInfoClick}
            className="absolute top-4 left-4 z-[200] w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors border-2 border-neutral-400"
            aria-label="View artwork info"
          >
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 pb-8 flex-shrink-0">
        <ActionButtons
          onPass={() => handleSwipe(false)}
          onLike={() => handleSwipe(true)}
          onDone={handleDone}
          likeCount={likedArtworks.length}
        />
      </div>

      {/* Info modal - uses captured artwork, not currentArtwork */}
      {infoArtwork && (
        <InfoModal
          artwork={infoArtwork}
          onClose={() => setInfoArtwork(null)}
        />
      )}

      {/* Fullscreen image modal */}
      {fullscreenImage && (
        <FullscreenImage
          src={fullscreenImage.src}
          alt={fullscreenImage.alt}
          onClose={() => setFullscreenImage(null)}
        />
      )}

      {/* Sign in modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => {
          setShowSignInModal(false)
          setPendingLikeArtwork(null)
        }}
        onContinueAnonymous={handleContinueAnonymous}
      />
    </main>
  )
}
