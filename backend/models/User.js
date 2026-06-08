const { getDb, saveDatabase } = require('../database/init');
const bcrypt = require('bcryptjs');

const User = {
  findByEmail: (email) => {
    const db = getDb();
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => user[col] = vals[i]);
    return user;
  },

  findById: (id) => {
    const db = getDb();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => user[col] = vals[i]);
    return user;
  },

  getAllAgents: () => {
    const db = getDb();
    const result = db.exec("SELECT * FROM users WHERE role IN ('agent', 'admin') ORDER BY name");
    if (result.length === 0) return [];
    return result[0].values.map(vals => {
      const user = {};
      result[0].columns.forEach((col, i) => user[col] = vals[i]);
      return user;
    });
  },

  create: (data) => {
    const db = getDb();
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    db.run(
      'INSERT INTO users (name, email, password, role, location, daily_target, commission_rate, language, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.email, hashedPassword, data.role || 'agent', data.location || null, data.daily_target || 0, data.commission_rate || 0, data.language || 'en', data.avatar || null]
    );
    saveDatabase();
    return User.findByEmail(data.email);
  },

  update: (id, data) => {
    const db = getDb();
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
    if (data.daily_target !== undefined) { fields.push('daily_target = ?'); values.push(data.daily_target); }
    if (data.commission_rate !== undefined) { fields.push('commission_rate = ?'); values.push(data.commission_rate); }
    if (data.language !== undefined) { fields.push('language = ?'); values.push(data.language); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
    if (data.password) {
      fields.push('password = ?');
      values.push(bcrypt.hashSync(data.password, 10));
    }
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    return User.findById(id);
  },

  deactivate: (id) => {
    const db = getDb();
    db.run("UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [id]);
    saveDatabase();
  },

  activate: (id) => {
    const db = getDb();
    db.run("UPDATE users SET is_active = 1, updated_at = datetime('now') WHERE id = ?", [id]);
    saveDatabase();
  },

  verifyPassword: (user, password) => {
    return bcrypt.compareSync(password, user.password);
  }
};

module.exports = User;