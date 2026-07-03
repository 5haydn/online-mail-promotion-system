import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import authRouter from './routes/auth.js'
import customersRouter from './routes/customers.js'
import notificationsRouter from './routes/notifications.js'
import { authMiddleware, seedAdmin } from './auth.js'
import { query } from './db.js'

const app = express()
const port = Number(process.env.PORT || 8000)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim())

app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: '在线邮件推广系统' })
})

app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  const [customerRow] = await query('SELECT COUNT(*) AS cnt FROM customers WHERE is_valid = 1')
  const [notifRow] = await query(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user.id],
  )
  res.json({
    total_customers: customerRow.cnt,
    unread_notifications: notifRow.cnt,
  })
})

app.use('/api/auth', authRouter)
app.use('/api/customers', customersRouter)
app.use('/api/notifications', notificationsRouter)

async function start() {
  try {
    await query('SELECT 1')
    await seedAdmin()
    app.listen(port, '127.0.0.1', () => {
      console.log(`后端已启动: http://127.0.0.1:${port}`)
    })
  } catch (err) {
    console.error('无法连接 MySQL，请先运行: npm run db:init')
    console.error(err.message)
    process.exit(1)
  }
}

start()
