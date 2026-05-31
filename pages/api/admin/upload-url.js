import { isAdminAuthenticated } from 'lib/admin-auth'
import { createUploadKey, createUploadUrl } from 'lib/aws-s3'

export default async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename, contentType } = req.body || {}
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' })
    }

    const key = createUploadKey({ filename })
    const payload = await createUploadUrl({ key, contentType })
    return res.status(200).json({ ...payload, key })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
