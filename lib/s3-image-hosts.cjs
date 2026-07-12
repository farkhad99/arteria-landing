/** @typedef {{ protocol: string, hostname: string, port: string, pathname: string }} RemotePattern */

/** Exact hostnames for next/image `domains` (no wildcards). */
const getMediaImageHostsFromEnv = () => {
  const hosts = []
  const storeId = process.env.BLOB_HOSTNAME
  if (storeId) {
    hosts.push(storeId.replace(/^https?:\/\//, '').replace(/\/$/, ''))
  }
  return [...new Set(hosts)]
}

/** Patterns for next.config.js `images.remotePatterns` (baked in at `next build`). */
const getMediaRemotePatterns = () => {
  /** @type {RemotePattern[]} */
  return [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '*.blob.vercel-storage.com',
      port: '',
      pathname: '/**',
    },
  ]
}

// Back-compat aliases used by older imports / verify script
const getS3ImageHostsFromEnv = getMediaImageHostsFromEnv
const getS3RemotePatterns = getMediaRemotePatterns
const S3_IMAGE_HOSTS = []

module.exports = {
  S3_IMAGE_HOSTS,
  getMediaImageHostsFromEnv,
  getMediaRemotePatterns,
  getS3ImageHostsFromEnv,
  getS3RemotePatterns,
}
