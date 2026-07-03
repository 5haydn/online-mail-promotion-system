import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './db.js'

const SECRET = process.env.SECRET_KEY || 'change-me'

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function createToken(username) {
  return jwt.sign({ sub: username }, SECRET, { expiresIn: '8h' })
}

export function decodeToken(token) {
  try {
    const payload = jwt.verify(token, SECRET)
    return payload.sub
  } catch {
    return null
  }
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ detail: '未登录' })
  }
  const username = decodeToken(header.slice(7))
  if (!username) {
    return res.status(401).json({ detail: '令牌无效或已过期' })
  }
  const users = await query('SELECT * FROM users WHERE username = ?', [username])
  if (!users.length) {
    return res.status(401).json({ detail: '用户不存在' })
  }
  req.user = users[0]
  next()
}

export async function seedAdmin() {
  const existing = await query('SELECT id FROM users WHERE username = ?', ['admin'])
  if (existing.length) return
  const hash = await hashPassword('admin123')
  await query(
    'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, 1)',
    ['admin', 'admin@example.com', hash],
  )
  console.log('默认管理员已创建: admin / admin123')
}
