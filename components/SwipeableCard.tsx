'use client'

import { useSwipeable } from 'react-swipeable'
import { useState, ReactNode } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  disabled?: boolean
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isLeaving, setIsLeaving] = useState<'left' | 'right' | null>(null)

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (disabled) return
      setOffset({ x: e.deltaX, y: e.deltaY * 0.3 })
    },
    onSwipedLeft: () => {
      if (disabled) return
      setIsLeaving('left')
      setTimeout(() => {
        onSwipeLeft()
        setOffset({ x: 0, y: 0 })
        setIsLeaving(null)
      }, 200)
    },
    onSwipedRight: () => {
      if (disabled) return
      setIsLeaving('right')
      setTimeout(() => {
        onSwipeRight()
        setOffset({ x: 0, y: 0 })
        setIsLeaving(null)
      }, 200)
    },
    onTouchEndOrOnMouseUp: () => {
      if (!isLeaving) {
        setOffset({ x: 0, y: 0 })
      }
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  })

  // Calculate rotation based on horizontal offset
  const rotation = offset.x * 0.05
  const opacity = Math.max(0, 1 - Math.abs(offset.x) / 500)

  // Determine overlay color based on swipe direction
  const showLikeOverlay = offset.x > 30
  const showPassOverlay = offset.x < -30

  // Animation for leaving
  const leaveTransform = isLeaving
    ? isLeaving === 'left'
      ? 'translateX(-150%) rotate(-30deg)'
      : 'translateX(150%) rotate(30deg)'
    : `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotation}deg)`

  return (
    <div
      {...handlers}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing"
      style={{
        transform: leaveTransform,
        opacity: isLeaving ? 0 : opacity,
        transition: isLeaving || offset.x === 0 ? 'all 0.2s ease-out' : 'none',
      }}
    >
      {/* Like overlay - low z-index so buttons stay clickable */}
      <div
        className="absolute inset-0 bg-green-500/30 rounded-2xl z-10 flex items-center justify-center pointer-events-none transition-opacity"
        style={{ opacity: showLikeOverlay ? Math.min((offset.x - 30) / 100, 1) : 0 }}
      >
        <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl transform -rotate-12 border-4 border-white">
          LIKE
        </div>
      </div>

      {/* Pass overlay - low z-index so buttons stay clickable */}
      <div
        className="absolute inset-0 bg-red-500/30 rounded-2xl z-10 flex items-center justify-center pointer-events-none transition-opacity"
        style={{ opacity: showPassOverlay ? Math.min((-offset.x - 30) / 100, 1) : 0 }}
      >
        <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-2xl transform rotate-12 border-4 border-white">
          PASS
        </div>
      </div>

      {children}
    </div>
  )
}
