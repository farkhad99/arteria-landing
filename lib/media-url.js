export const isVideoUrl = (url = '') =>
  /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
  url.includes('videos.ctfassets.net')

export const isS3MediaUrl = (url = '') =>
  /\.amazonaws\.com\//i.test(url) || /\.s3[.-]/i.test(url)
