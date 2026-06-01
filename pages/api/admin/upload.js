import { isAdminAuthenticated } from 'lib/admin-auth'
import { createUploadKey, uploadObject } from 'lib/aws-s3'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from 'lib/upload-limits'

export const config = {
  api: {
    bodyParser: false,
  },
}

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

export default async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const filename = req.headers['x-filename']
    const contentType = req.headers['content-type']

    if (!filename || !contentType) {
      return res.status(400).json({
        error: 'X-Filename and Content-Type headers are required',
      })
    }

    const body = await readRequestBody(req)
    if (!body.length) {
      return res.status(400).json({ error: 'Empty upload body' })
    }

    if (body.length > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: `File exceeds maximum size of ${MAX_UPLOAD_LABEL}`,
      })
    }

    const key = createUploadKey({ filename: String(filename) })
    const { fileUrl } = await uploadObject({ key, contentType, body })

    return res.status(200).json({
      key,
      fileUrl,
      kind: String(contentType).startsWith('video/') ? 'video' : 'image',
      contentType,
    })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
