import { Router } from 'express'
import { authMiddleware } from '../auth.js'
import { query } from '../db.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const unreadOnly = req.query.unread_only === 'true'
  const skip = Math.max(0, Number(req.query.skip) || 0)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))

  let sql = 'SELECT * FROM notifications WHERE user_id = ?'
  const params = [req.user.id]
  if (unreadOnly) {
    sql += ' AND is_read = 0'
  }
  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?'
  params.push(limit, skip)

  const rows = await query(sql, params)
  res.json(rows.map((r) => ({ ...r, is_read: !!r.is_read })))
})

router.post('/:id/read', authMiddleware, async (req, res) => {
  await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [
    req.params.id,
    req.user.id,
  ])
  res.json({ ok: true })
})

router.post('/read-all', authMiddleware, async (req, res) => {
  await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [
    req.user.id,
  ])
  res.json({ ok: true })
})

export default router
