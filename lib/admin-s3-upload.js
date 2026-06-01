import { parseApiResponse } from 'lib/parse-api-response'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from 'lib/upload-limits'

/**
 * Fast path: presign on the app, upload bytes directly to S3 from the browser.
 */
export async function uploadFileToS3(file) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds ${MAX_UPLOAD_LABEL} limit`)
  }

  const presignResponse = await fetch('/api/admin/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  })

  const { data: presign } = await parseApiResponse(presignResponse)
  if (!presignResponse.ok) {
    throw new Error(presign.error || 'Failed to prepare upload')
  }

  const s3Response = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!s3Response.ok) {
    throw new Error(
      'Direct S3 upload failed. Check S3 CORS allows PUT from this site (docs/s3-cors.json).',
    )
  }

  const url = presign.fileUrl || presign.url
  if (!url) {
    throw new Error('Upload succeeded but no file URL was returned')
  }

  return {
    kind: presign.kind,
    title: file.name,
    url,
    s3Key: presign.key,
    contentType: presign.contentType || file.type,
    columnSpan: 'two_columns',
  }
}
