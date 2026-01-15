'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TasteProfile } from '@/lib/types'
import { getTasteProfile, getCollection } from '@/lib/storage'

export default function SummaryPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TasteProfile | null>(null)
  const [collectionCount, setCollectionCount] = useState(0)

  useEffect(() => {
    const savedProfile = getTasteProfile()
    const collection = getCollection()

    if (!savedProfile) {
      // No profile yet, redirect to discover
      router.push('/discover')
      return
    }

    setProfile(savedProfile)
    setCollectionCount(collection.artworks.length)
  }, [router])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
      </div>
    )
  }

  const likeRate = profile.totalSwiped > 0
    ? Math.round((profile.totalLiked / profile.totalSwiped) * 100)
    : 0

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold mb-2">Your Taste Profile</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Based on your exploration session
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold">{profile.totalSwiped}</div>
            <div className="text-xs text-neutral-500">Viewed</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-500">{profile.totalLiked}</div>
            <div className="text-xs text-neutral-500">Liked</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold">{likeRate}%</div>
            <div className="text-xs text-neutral-500">Like Rate</div>
          </div>
        </div>

        {/* Summary text */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">✨</span>
            Your Art Personality
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {profile.summary}
          </p>
        </div>

        {/* Preferences breakdown */}
        {profile.preferredMediums.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Preferred Mediums</h2>
            <div className="flex flex-wrap gap-2">
              {profile.preferredMediums.slice(0, 5).map((medium, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm"
                >
                  {medium.name} ({medium.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.preferredDepartments.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Art Categories</h2>
            <div className="flex flex-wrap gap-2">
              {profile.preferredDepartments.slice(0, 5).map((dept, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm"
                >
                  {dept.name} ({dept.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.favoriteArtists.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Artists You Gravitate Toward</h2>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteArtists.map((artist, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          <Link
            href="/collection"
            className="block w-full py-4 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            View Collection ({collectionCount} pieces)
          </Link>

          <Link
            href="/discover"
            className="block w-full py-4 px-6 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-semibold text-center border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Explore More Art
          </Link>

          <Link
            href="/"
            className="block text-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm pt-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
