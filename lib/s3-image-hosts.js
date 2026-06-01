/** Hostnames allowed for next/image (keep in sync with AWS bucket region). */
export const S3_IMAGE_HOSTS = [
  'arteria-uploads.s3.eu-north-1.amazonaws.com',
  'arteria-uploads.s3.eu-central-1.amazonaws.com',
]

export const getS3ImageHostsFromEnv = () => {
  const bucket = process.env.AWS_S3_BUCKET || 'arteria-uploads'
  const region = process.env.AWS_REGION || 'eu-north-1'
  const primary = `${bucket}.s3.${region}.amazonaws.com`
  return [...new Set([primary, ...S3_IMAGE_HOSTS])]
}
