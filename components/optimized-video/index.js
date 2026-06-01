import cn from 'clsx'
import s from './optimized-video.module.scss'

/**
 * Next.js 14 has no built-in video optimizer (unlike next/image).
 * MP4/WebM are streamed from S3; the browser handles range requests and decoding.
 * GIFs are not videos — they use next/image via ComposableImage / MediaPreviewImage.
 *
 * For smaller files: compress MP4 before upload (e.g. H.264, 1080p cap). Server-side
 * transcoding (MediaConvert, ffmpeg on upload) can be added later if needed.
 */
export function OptimizedVideo({ src, className, poster }) {
  return (
    <div className={cn(s.wrap, className)}>
      <video
        className={s.video}
        src={src}
        poster={poster}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
      />
    </div>
  )
}
