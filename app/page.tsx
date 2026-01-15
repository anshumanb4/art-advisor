'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getCollection } from '@/lib/storage'
import { getCollectionDB } from '@/lib/actions/collection'
import UserMenu from '@/components/UserMenu'

export default function Home() {
  const { data: session, status } = useSession()
  const [collectionCount, setCollectionCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      if (status === 'loading') return

      if (session?.user) {
        const dbCollection = await getCollectionDB()
        setCollectionCount(dbCollection.artworks.length)
      } else {
        const collection = getCollection()
        setCollectionCount(collection.artworks.length)
      }
    }

    loadCount()
  }, [session, status])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 relative">
      {/* User menu in top right */}
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Art Advisor
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Discover your taste in art
          </p>
        </div>

        {/* Hero description */}
        <p className="text-neutral-500 dark:text-neutral-500">
          Swipe through masterpieces from world-renowned museums.
          Build your personal collection and uncover what kind of art speaks to you.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-4">
          <Link
            href="/discover"
            className="block w-full py-4 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Start Exploring
          </Link>

          <Link
            href="/collection"
            className="block w-full py-4 px-6 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-semibold text-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            View Collection
            {collectionCount > 0 && (
              <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                ({collectionCount} pieces)
              </span>
            )}
          </Link>
        </div>

        {/* Features */}
        <div className="pt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">🎨</div>
            <div className="text-xs text-neutral-500">Curated Art</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">👆</div>
            <div className="text-xs text-neutral-500">Swipe to Save</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📊</div>
            <div className="text-xs text-neutral-500">Taste Analysis</div>
          </div>
        </div>

        {/* Attribution */}
        <p className="text-xs text-neutral-400 pt-8">
          Art from The Metropolitan Museum of Art & Art Institute of Chicago
        </p>
      </div>
    </main>
  )
}
