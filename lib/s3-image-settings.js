import { isGifUrl, isS3MediaUrl } from 'lib/media-url'

/** Use /_next/image for S3 only when explicitly enabled (and never for GIFs). */
export const shouldUseS3ImageOptimizer = (url = '') => {
  if (isGifUrl(url)) return false
  return (
    isS3MediaUrl(url) &&
    process.env.NEXT_PUBLIC_S3_IMAGE_OPTIMIZER === 'true'
  )
}

export const shouldUnoptimizeImage = (url = '') =>
  isS3MediaUrl(url) && !shouldUseS3ImageOptimizer(url)
