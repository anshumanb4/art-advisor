'use client'

interface ActionButtonsProps {
  onPass: () => void
  onLike: () => void
  onDone: () => void
  disabled?: boolean
  likeCount: number
}

export default function ActionButtons({
  onPass,
  onLike,
  onDone,
  disabled = false,
  likeCount,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Pass button */}
      <button
        onClick={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Pass"
      >
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Done button */}
      <button
        onClick={onDone}
        className="px-6 py-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Done {likeCount > 0 && `(${likeCount})`}
      </button>

      {/* Like button */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center border border-neutral-200 dark:border-neutral-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Like"
      >
        <svg
          className="w-8 h-8 text-green-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  )
}
