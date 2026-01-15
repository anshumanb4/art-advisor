'use client'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'Loading artworks...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-900">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-neutral-700 rounded-full animate-spin border-t-white" />
      </div>
      <p className="mt-4 text-neutral-400 text-center">
        {message}
      </p>
    </div>
  )
}
