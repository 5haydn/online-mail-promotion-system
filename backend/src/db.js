import mysql from 'mysql2/promise'

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'localdev',
  database: process.env.DB_NAME || 'mail_promotion',
}

export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
})

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}
