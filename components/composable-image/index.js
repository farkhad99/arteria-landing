import cn from 'clsx'
import { OptimizedVideo } from 'components/optimized-video'
import { isS3MediaUrl, isVideoUrl } from 'lib/media-url'
import NextImage from 'next/image'
import s from './composable-image.module.scss'

/** Project panel thumbnails — keep srcset widths small */
export const PROJECT_CARD_SIZES = {
  oneColumn: '(max-width: 800px) 100vw, 28vw',
  twoColumns: '(max-width: 800px) 100vw, 52vw',
}

/** Full-screen gallery — larger optimized variants */
export const GALLERY_IMAGE_SIZES = '(max-width: 800px) 100vw, 92vw'

export function ComposableImage({
  sources,
  width = 684,
  height = 403,
  large = false,
  small = false,
  priority = false,
  sizes,
  quality,
}) {
  const amount = sources.items.length
  const imageSizes = sizes ?? (large ? GALLERY_IMAGE_SIZES : PROJECT_CARD_SIZES.twoColumns)
  const imageQuality = quality ?? (large ? 92 : 80)

  return (
    <div className={s.images}>
      {sources.items.map((source) => {
        const url = source.url
        const itemWidth = Math.round(width / amount)
        const className = cn(s.image, large && s.large, small && s.small)
        const style = { '--height': height, '--width': itemWidth }

        if (isVideoUrl(url)) {
          return (
            <OptimizedVideo
              key={url}
              src={url}
              className={cn(className, s.videoWrap)}
            />
          )
        }

        // S3: load directly from the bucket. Production was still serving an old
        // build where /_next/image rejected S3 hostnames (400 "url not allowed").
        // Set NEXT_PUBLIC_S3_IMAGE_OPTIMIZER=true after deploy verifies /_next/image.
        const useImageOptimizer =
          process.env.NEXT_PUBLIC_S3_IMAGE_OPTIMIZER === 'true'

        return (
          <NextImage
            key={url}
            src={url}
            alt={source.title || ''}
            width={itemWidth}
            height={height}
            className={className}
            style={style}
            priority={priority}
            quality={imageQuality}
            sizes={imageSizes}
            unoptimized={isS3MediaUrl(url) && !useImageOptimizer}
          />
        )
      })}
    </div>
  )
}
