'use client'

import { useState } from 'react'

interface FullscreenImageProps {
  src: string
  alt: string
  onClose: () => void
}

export default function FullscreenImage({ src, alt, onClose }: FullscreenImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
      onClick={onClose}
    >
      {/* Loading spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-neutral-600 border-t-neutral-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Fullscreen image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        style={{ opacity: imageLoaded ? 1 : 0 }}
        onLoad={() => setImageLoaded(true)}
        referrerPolicy="no-referrer"
      />

      {/* Close hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        Tap anywhere to close
      </div>
    </div>
  )
}
