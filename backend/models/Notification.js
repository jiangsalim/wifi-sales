const { getDb, saveDatabase } = require('../database/init');

const Notification = {
  create: (userId, type, title, message, data = null) => {
    const db = getDb();
    db.run(
      'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
    saveDatabase();
  },

  getByUser: (userId, page = 1, perPage = 20) => {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    if (result.length === 0) return { notifications: [], total: 0 };
    
    const all = result[0].values.map(vals => {
      const n = {};
      result[0].columns.forEach((col, i) => n[col] = vals[i]);
      if (n.data) n.data = JSON.parse(n.data);
      return n;
    });

    const total = all.length;
    const offset = (page - 1) * perPage;
    return { notifications: all.slice(offset, offset + perPage), total, page, perPage };
  },

  markRead: (id, userId) => {
    const db = getDb();
    db.run("UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?", [id, userId]);
    saveDatabase();
  },

  markAllRead: (userId) => {
    const db = getDb();
    db.run("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL", [userId]);
    saveDatabase();
  },

  unreadCount: (userId) => {
    const db = getDb();
    const result = db.exec('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL', [userId]);
    return result[0].values[0][0];
  }
};

module.exports = Notification;