import {
  buildSessionCookie,
  createAdminSessionToken,
  clearSessionCookie,
} from 'lib/admin-auth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', clearSessionCookie())
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = createAdminSessionToken()
  res.setHeader('Set-Cookie', buildSessionCookie(token))
  return res.status(200).json({ ok: true })
}
