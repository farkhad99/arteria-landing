import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]

const getAwsEnv = () => {
  const region = process.env.AWS_REGION
  const bucket = process.env.AWS_S3_BUCKET
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS S3 environment variables')
  }

  return { region, bucket, accessKeyId, secretAccessKey }
}

export const getS3Client = () => {
  const { region, accessKeyId, secretAccessKey } = getAwsEnv()
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export const createUploadKey = ({ filename }) => {
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin'
  return `projects/${Date.now()}-${crypto.randomUUID()}.${ext}`
}

export const createUploadUrl = async ({ key, contentType }) => {
  const { bucket, region } = getAwsEnv()
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Unsupported media type')
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 300,
  })

  return {
    uploadUrl,
    fileUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  }
}

export const uploadObject = async ({ key, contentType, body }) => {
  const { bucket, region } = getAwsEnv()
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Unsupported media type')
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )

  return {
    key,
    fileUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  }
}
