import { Router } from 'express'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { authMiddleware } from '../auth.js'
import { query } from '../db.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const TEMPLATE_HEADERS = ['客户邮箱', '姓名', '公司', '行业', '意向产品', '联系方式', '备注']

router.get('/template', authMiddleware, (_req, res) => {
  const ws = XLSX.utils.aoa_to_sheet([
    TEMPLATE_HEADERS,
    ['example@company.com', '张三', '示例公司', '互联网', '产品A', '13800000000', ''],
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '客户数据')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  res.setHeader('Content-Disposition', 'attachment; filename=customer_template.xlsx')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.send(buf)
})

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).json({ detail: '未选择文件' })
  }
  const ext = '.' + file.originalname.split('.').pop().toLowerCase()
  if (!['.xlsx', '.xls'].includes(ext)) {
    return res.status(400).json({ detail: '仅支持 xlsx/xls 文件' })
  }

  const groupId = req.query.group_id ? Number(req.query.group_id) : null
  const batchResult = await query(
    "INSERT INTO upload_batches (filename, status, uploaded_by) VALUES (?, 'processing', ?)",
    [file.originalname, req.user.id],
  )
  const batchId = batchResult.insertId

  let rows
  try {
    const wb = XLSX.read(file.buffer, { type: 'buffer' })
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })
    rows = rows.slice(1)
  } catch {
    await query("UPDATE upload_batches SET status = 'failed' WHERE id = ?", [batchId])
    return res.status(400).json({ detail: '无法解析 Excel 文件' })
  }

  const seen = new Set()
  let validCount = 0
  let errorCount = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((cell) => String(cell).trim() === '')) continue

    const cells = row.map((c) => String(c ?? '').trim())
    while (cells.length < 7) cells.push('')
    const [email, name, company, industry, product, phone, notes] = cells
    const errors = []

    if (!email) errors.push('邮箱为空')
    else if (!EMAIL_RE.test(email)) errors.push('邮箱格式无效')
    else if (seen.has(email.toLowerCase())) errors.push('邮箱重复')

    if (errors.length) errorCount++
    else {
      seen.add(email.toLowerCase())
      validCount++
    }

    await query(
      `INSERT INTO customers
        (group_id, email, name, company, industry, product_interest, phone, notes, is_valid, validation_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        groupId,
        email || `invalid_${i + 2}`,
        name || null,
        company || null,
        industry || null,
        product || null,
        phone || null,
        notes || null,
        errors.length ? 0 : 1,
        errors.length ? errors.join('; ') : null,
      ],
    )
  }

  await query(
    "UPDATE upload_batches SET status = 'completed', total_rows = ?, valid_rows = ?, error_rows = ? WHERE id = ?",
    [validCount + errorCount, validCount, errorCount, batchId],
  )

  const batches = await query('SELECT * FROM upload_batches WHERE id = ?', [batchId])
  res.json(batches[0])
})

router.get('/', authMiddleware, async (req, res) => {
  const groupId = req.query.group_id ? Number(req.query.group_id) : null
  const validOnly = req.query.valid_only !== 'false'
  const skip = Math.max(0, Number(req.query.skip) || 0)
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50))

  let sql = 'SELECT * FROM customers WHERE 1=1'
  const params = []
  if (groupId) {
    sql += ' AND group_id = ?'
    params.push(groupId)
  }
  if (validOnly) {
    sql += ' AND is_valid = 1'
  }
  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?'
  params.push(limit, skip)

  const rows = await query(sql, params)
  res.json(rows.map((r) => ({ ...r, is_valid: !!r.is_valid })))
})

router.get('/groups', authMiddleware, async (_req, res) => {
  const groups = await query('SELECT * FROM customer_groups ORDER BY id DESC')
  res.json(groups)
})

router.post('/groups', authMiddleware, async (req, res) => {
  const { name, description } = req.body || {}
  if (!name?.trim()) {
    return res.status(400).json({ detail: '请输入分组名称' })
  }
  const result = await query('INSERT INTO customer_groups (name, description) VALUES (?, ?)', [
    name.trim(),
    description || null,
  ])
  const groups = await query('SELECT * FROM customer_groups WHERE id = ?', [result.insertId])
  res.status(201).json(groups[0])
})

export default router
