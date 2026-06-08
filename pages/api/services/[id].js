import { isAdminAuthenticated } from 'lib/admin-auth'
import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { name } = req.body || {}
      const trimmed = String(name || '').trim()

      if (!trimmed) {
        return res.status(400).json({ error: 'name is required' })
      }

      const item = await prisma.studioService.update({
        where: { id },
        data: { name: trimmed },
      })

      return res.status(200).json({ item })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.studioService.delete({ where: { id } })
      return res.status(200).json({ ok: true })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
