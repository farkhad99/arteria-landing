import { Image } from '@studio-freight/compono'
import cn from 'clsx'
import { OptimizedVideo } from 'components/optimized-video'
import { isVideoUrl } from 'lib/media-url'
import s from './composable-image.module.scss'

export function ComposableImage({
  sources,
  width = 684,
  height = 403,
  large = false,
  small = false,
  priority = false,
}) {
  const amount = sources.items.length

  return (
    <div className={s.images}>
      {sources.items.map((source) => {
        const url = source.url

        if (isVideoUrl(url)) {
          return (
            <OptimizedVideo
              key={url}
              src={url}
              className={cn(s.image, s.videoWrap, large && s.large, small && s.small)}
            />
          )
        }

        return (
          <Image
            key={url}
            src={url}
            alt={source.title || ''}
            width={width / amount}
            height={height}
            className={cn(s.image, large && s.large, small && s.small)}
            style={{ '--height': height, '--width': width / amount }}
            priority={priority}
            quality={95}
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        )
      })}
    </div>
  )
}
