import { Router } from 'express'
import { authMiddleware, createToken, hashPassword, verifyPassword } from '../auth.js'
import { query } from '../db.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  const users = await query('SELECT * FROM users WHERE username = ?', [username])
  const user = users[0]
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ detail: '用户名或密码错误' })
  }
  res.json({ access_token: createToken(user.username), token_type: 'bearer' })
})

router.get('/me', authMiddleware, (req, res) => {
  const { id, username, email, is_admin, created_at } = req.user
  res.json({ id, username, email, is_admin: !!is_admin, created_at })
})

router.post('/users', authMiddleware, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ detail: '需要管理员权限' })
  }
  const { username, email, password, is_admin = false } = req.body || {}
  const dup = await query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])
  if (dup.length) {
    return res.status(400).json({ detail: '用户名或邮箱已存在' })
  }
  const hash = await hashPassword(password)
  const result = await query(
    'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
    [username, email, hash, is_admin ? 1 : 0],
  )
  const users = await query('SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?', [
    result.insertId,
  ])
  const user = users[0]
  res.status(201).json({ ...user, is_admin: !!user.is_admin })
})

export default router
