import { isAdminAuthenticated } from 'lib/admin-auth'
import { createUploadKey, createUploadUrl } from 'lib/aws-s3'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from 'lib/upload-limits'

export default async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename, contentType, size } = req.body || {}
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' })
    }

    if (typeof size === 'number' && size > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: `File exceeds maximum size of ${MAX_UPLOAD_LABEL}`,
      })
    }

    const key = createUploadKey({ filename })
    const payload = await createUploadUrl({ key, contentType })

    return res.status(200).json({
      ...payload,
      key,
      url: payload.fileUrl,
    })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
