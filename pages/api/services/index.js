import { isAdminAuthenticated } from 'lib/admin-auth'
import { prisma } from 'lib/prisma'

const listServices = () =>
  prisma.studioService.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await listServices()
    return res.status(200).json({ items })
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body || {}
      const trimmed = String(name || '').trim()

      if (!trimmed) {
        return res.status(400).json({ error: 'name is required' })
      }

      const { _max } = await prisma.studioService.aggregate({
        _max: { sortOrder: true },
      })
      const nextSortOrder = (_max.sortOrder ?? -1) + 1

      const item = await prisma.studioService.create({
        data: { name: trimmed, sortOrder: nextSortOrder },
      })

      return res.status(201).json({ item })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
