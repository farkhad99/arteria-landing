import cn from 'clsx'
import { OptimizedVideo } from 'components/optimized-video'
import {
  GALLERY_IMAGE_SIZES,
  IMAGE_DIMENSIONS,
  IMAGE_QUALITY,
  MOBILE_CARD_SIZES,
  PROJECT_CARD_SIZES,
} from 'lib/media-delivery'
import { shouldUnoptimizeImage } from 'lib/s3-image-settings'
import { isVideoUrl } from 'lib/media-url'
import NextImage from 'next/image'
import s from './composable-image.module.scss'

export {
  GALLERY_IMAGE_SIZES,
  MOBILE_CARD_SIZES,
  PROJECT_CARD_SIZES,
} from 'lib/media-delivery'

const VARIANT_PRESETS = {
  card: {
    sizes: PROJECT_CARD_SIZES.twoColumns,
    quality: IMAGE_QUALITY.card,
    ...IMAGE_DIMENSIONS.card,
  },
  cardSmall: {
    sizes: MOBILE_CARD_SIZES,
    quality: IMAGE_QUALITY.mobile,
    ...IMAGE_DIMENSIONS.cardSmall,
  },
  gallery: {
    sizes: GALLERY_IMAGE_SIZES,
    quality: IMAGE_QUALITY.gallery,
    ...IMAGE_DIMENSIONS.gallery,
  },
}

export function ComposableImage({
  sources,
  width,
  height,
  large = false,
  small = false,
  priority = false,
  sizes,
  quality,
  variant,
}) {
  const presetKey =
    variant || (large ? 'gallery' : small ? 'cardSmall' : 'card')
  const preset = VARIANT_PRESETS[presetKey] || VARIANT_PRESETS.card

  const displayWidth = width ?? preset.width
  const displayHeight = height ?? preset.height
  const imageSizes = sizes ?? preset.sizes
  const imageQuality = quality ?? preset.quality

  const amount = sources.items.length

  return (
    <div className={s.images}>
      {sources.items.map((source, index) => {
        const url = source.url
        const itemWidth = Math.round(displayWidth / amount)
        const itemHeight = Math.round(displayHeight / amount)
        const className = cn(s.image, large && s.large, small && s.small)
        const style = { '--height': itemHeight, '--width': itemWidth }
        const isPriority = priority && index === 0

        if (isVideoUrl(url)) {
          return (
            <OptimizedVideo
              key={url}
              src={url}
              className={cn(className, s.videoWrap)}
              priority={isPriority}
            />
          )
        }

        return (
          <NextImage
            key={url}
            src={url}
            alt={source.title || ''}
            width={itemWidth}
            height={itemHeight}
            className={className}
            style={style}
            priority={isPriority}
            loading={isPriority ? undefined : 'lazy'}
            fetchPriority={isPriority ? 'high' : 'low'}
            quality={imageQuality}
            sizes={imageSizes}
            unoptimized={shouldUnoptimizeImage(url)}
          />
        )
      })}
    </div>
  )
}
