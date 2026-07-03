import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { dbConfig, pool } from './db.js'
import { seedAdmin } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '..', 'schema.sql')

async function init() {
  const { host, port, user, password } = dbConfig
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true })
  const sql = fs.readFileSync(schemaPath, 'utf8')
  await conn.query(sql)
  await conn.end()
  console.log(`数据库已初始化: ${dbConfig.database}`)
  await seedAdmin()
  await pool.end()
}

init().catch((err) => {
  console.error('数据库初始化失败:', err.message)
  process.exit(1)
})
