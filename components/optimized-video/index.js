import cn from 'clsx'
import s from './optimized-video.module.scss'

/**
 * Next.js does not optimize video like next/image. We serve MP4/WebM directly
 * from S3 with browser-friendly attributes (range requests, lazy metadata).
 */
export function OptimizedVideo({ src, className }) {
  return (
    <div className={cn(s.wrap, className)}>
      <video
        className={s.video}
        src={src}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
      />
    </div>
  )
}
