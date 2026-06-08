const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './database/wifi-sales.db');

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agent',
      location TEXT,
      daily_target INTEGER DEFAULT 0,
      commission_rate INTEGER DEFAULT 0,
      language TEXT DEFAULT 'en',
      avatar TEXT,
      device_token TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      shift_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      total_sales INTEGER NOT NULL,
      expenses INTEGER DEFAULT 0,
      expense_reason TEXT,
      net INTEGER NOT NULL,
      missed_shift_ids TEXT,
      month_year TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      locked INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES users(id),
      FOREIGN KEY (shift_id) REFERENCES shifts(id),
      UNIQUE(agent_id, shift_id, entry_date)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      read_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDatabase();
  console.log('Database initialized');
  return db;
}

function saveDatabase() {
  const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './database/wifi-sales.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

module.exports = { initDatabase, getDb, saveDatabase };