/** MP4/WebM/MOV only — GIFs are images (`image/gif`), not videos. */
export const isVideoUrl = (url = '') =>
  /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
  url.includes('videos.ctfassets.net')

export const isGifUrl = (url = '') => /\.gif(\?|$)/i.test(url)

export const isS3MediaUrl = (url = '') =>
  /\.amazonaws\.com\//i.test(url) || /\.s3[.-]/i.test(url)
