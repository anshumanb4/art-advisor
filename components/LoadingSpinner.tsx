'use client'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'Loading artworks...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-neutral-200 dark:border-neutral-700 rounded-full animate-spin border-t-neutral-800 dark:border-t-white" />
      </div>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-center">
        {message}
      </p>
    </div>
  )
}
