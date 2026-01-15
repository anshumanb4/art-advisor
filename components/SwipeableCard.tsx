'use client'

import { useSwipeable } from 'react-swipeable'
import { useState, useRef, ReactNode } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onTap?: () => void
  disabled?: boolean
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  disabled = false,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isLeaving, setIsLeaving] = useState<'left' | 'right' | null>(null)
  const hasMoved = useRef(false)

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (disabled) return
      hasMoved.current = true
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
    onTouchStartOrOnMouseDown: () => {
      hasMoved.current = false
    },
    onTouchEndOrOnMouseUp: () => {
      if (!isLeaving) {
        setOffset({ x: 0, y: 0 })
      }
      // Detect tap: no significant movement occurred
      if (!hasMoved.current && onTap && !disabled) {
        onTap()
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
        opacity: isLeaving ? 0 : 1,
        transition: isLeaving || offset.x === 0 ? 'all 0.2s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  )
}
