/** @typedef {{ protocol: string, hostname: string, port: string, pathname: string }} RemotePattern */

const S3_IMAGE_HOSTS = [
  'arteria-uploads.s3.eu-north-1.amazonaws.com',
  'arteria-uploads.s3.eu-central-1.amazonaws.com',
]

const getS3ImageHostsFromEnv = () => {
  const bucket = process.env.AWS_S3_BUCKET || 'arteria-uploads'
  const region = process.env.AWS_REGION || 'eu-north-1'
  const primary = `${bucket}.s3.${region}.amazonaws.com`
  return [...new Set([primary, ...S3_IMAGE_HOSTS])]
}

/** Patterns for next.config.js `images.remotePatterns` (baked in at `next build`). */
const getS3RemotePatterns = () => {
  const bucket = process.env.AWS_S3_BUCKET || 'arteria-uploads'
  const region = process.env.AWS_REGION || 'eu-north-1'
  const hostnames = getS3ImageHostsFromEnv()

  /** @type {RemotePattern[]} */
  const patterns = hostnames.map((hostname) => ({
    protocol: 'https',
    hostname,
    port: '',
    pathname: '/**',
  }))

  // Path-style URLs: https://s3.<region>.amazonaws.com/<bucket>/...
  patterns.push({
    protocol: 'https',
    hostname: `s3.${region}.amazonaws.com`,
    port: '',
    pathname: `/${bucket}/**`,
  })

  // Virtual-hosted URLs in any region for this bucket name
  patterns.push({
    protocol: 'https',
    hostname: `${bucket}.s3.*.amazonaws.com`,
    port: '',
    pathname: '/**',
  })

  // Catch-all for standard regional S3 hostnames (e.g. bucket.s3.eu-north-1.amazonaws.com)
  patterns.push({
    protocol: 'https',
    hostname: '**.amazonaws.com',
    port: '',
    pathname: '/**',
  })

  return patterns
}

module.exports = {
  S3_IMAGE_HOSTS,
  getS3ImageHostsFromEnv,
  getS3RemotePatterns,
}
