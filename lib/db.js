import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'piracy_user',
  password: process.env.DB_PASS || 'Support@22$#',
  database: process.env.DB_NAME || 'piracy_reporting',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
}

// In Next.js dev mode, hot reloads create new module instances without closing the old pool,
// exhausting MySQL max_connections. Store the pool on `global` so it survives reloads.
const globalWithPool = global

export function getPool() {
  if (!globalWithPool._mysqlPool) {
    globalWithPool._mysqlPool = mysql.createPool(dbConfig)
  }
  return globalWithPool._mysqlPool
}

export async function query(sql, params = []) {
  try {
    const [results] = await getPool().query(sql, params)
    return results
  } catch (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ER_CON_COUNT_ERROR') {
      globalWithPool._mysqlPool = null
    }
    throw err
  }
}