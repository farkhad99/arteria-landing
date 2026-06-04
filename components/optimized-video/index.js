import { useIntersectionObserver } from '@darkroom.engineering/hamo'
import cn from 'clsx'
import { useEffect, useRef } from 'react'
import s from './optimized-video.module.scss'

/**
 * Videos are not optimized by Next.js — we lazy-load until near the viewport,
 * then stream from S3 with metadata-first preload.
 */
export function OptimizedVideo({
  src,
  className,
  poster,
  priority = false,
  paused = false,
}) {
  const videoRef = useRef(null)
  const [setRef, entry] = useIntersectionObserver({
    threshold: 0.12,
    rootMargin: '160px 0px',
  })

  const isNearViewport = priority || Boolean(entry?.isIntersecting)
  const shouldPlay = isNearViewport && !paused

  useEffect(() => {
    const video = videoRef.current
    if (!video || !isNearViewport) return

    if (shouldPlay) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [shouldPlay, isNearViewport])

  return (
    <div ref={setRef} className={cn(s.wrap, className)}>
      <video
        ref={videoRef}
        className={s.video}
        src={isNearViewport ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload={priority ? 'auto' : isNearViewport ? 'metadata' : 'none'}
      />
    </div>
  )
}
