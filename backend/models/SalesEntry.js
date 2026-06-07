const { getDb, saveDatabase } = require('../database/init');

const SalesEntry = {
  create: (data) => {
    const db = getDb();
    db.run(
      `INSERT INTO sales_entries (agent_id, shift_id, entry_date, total_sales, expenses, expense_reason, net, missed_shift_ids, month_year, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        data.agent_id, data.shift_id, data.entry_date, data.total_sales,
        data.expenses || 0, data.expense_reason || null, data.net,
        data.missed_shift_ids ? JSON.stringify(data.missed_shift_ids) : null,
        data.month_year
      ]
    );
    saveDatabase();
    const result = db.exec('SELECT * FROM sales_entries WHERE id = last_insert_rowid()');
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const entry = {};
    cols.forEach((col, i) => entry[col] = vals[i]);
    return entry;
  },

  findByAgentAndShiftAndDate: (agentId, shiftId, date) => {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM sales_entries WHERE agent_id = ? AND shift_id = ? AND entry_date = ?',
      [agentId, shiftId, date]
    );
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const entry = {};
    cols.forEach((col, i) => entry[col] = vals[i]);
    return entry;
  },

  getByAgent: (agentId, dateFrom, dateTo, page = 1, perPage = 15) => {
    const db = getDb();
    let query = 'SELECT * FROM sales_entries WHERE agent_id = ?';
    const params = [agentId];

    if (dateFrom) {
      query += ' AND entry_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND entry_date <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY entry_date DESC, shift_id DESC';

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = db.exec(countQuery, params);
    const total = countResult[0].values[0][0];

    // Paginate
    const offset = (page - 1) * perPage;
    query += ` LIMIT ${perPage} OFFSET ${offset}`;
    const result = db.exec(query, params);

    const entries = result.length > 0 ? result[0].values.map(vals => {
      const entry = {};
      result[0].columns.forEach((col, i) => entry[col] = vals[i]);
      if (entry.missed_shift_ids) entry.missed_shift_ids = JSON.parse(entry.missed_shift_ids);
      return entry;
    }) : [];

    return { entries, total, page, perPage };
  },

  getAll: (filters = {}) => {
    const db = getDb();
    let query = 'SELECT se.*, u.name as agent_name, u.location as agent_location, s.name as shift_name FROM sales_entries se JOIN users u ON se.agent_id = u.id JOIN shifts s ON se.shift_id = s.id WHERE 1=1';
    const params = [];

    if (filters.dateFrom) { query += ' AND se.entry_date >= ?'; params.push(filters.dateFrom); }
    if (filters.dateTo) { query += ' AND se.entry_date <= ?'; params.push(filters.dateTo); }
    if (filters.agent_id) { query += ' AND se.agent_id = ?'; params.push(filters.agent_id); }
    if (filters.shift_id) { query += ' AND se.shift_id = ?'; params.push(filters.shift_id); }

    query += ' ORDER BY se.submitted_at DESC';

    const result = db.exec(query, params);
    if (result.length === 0) return [];

    return result[0].values.map(vals => {
      const entry = {};
      result[0].columns.forEach((col, i) => entry[col] = vals[i]);
      if (entry.missed_shift_ids) entry.missed_shift_ids = JSON.parse(entry.missed_shift_ids);
      return entry;
    });
  },

  getDailyStats: (date) => {
    const db = getDb();
    const result = db.exec(
      'SELECT COALESCE(SUM(total_sales), 0) as gross, COALESCE(SUM(expenses), 0) as expenses, COALESCE(SUM(net), 0) as net, COUNT(*) as count FROM sales_entries WHERE entry_date = ?',
      [date]
    );
    const vals = result[0].values[0];
    return { gross: vals[0], expenses: vals[1], net: vals[2], count: vals[3] };
  },

  getMonthlyData: (monthYear) => {
    const db = getDb();
    const result = db.exec(
      'SELECT entry_date, SUM(total_sales) as gross, SUM(net) as net FROM sales_entries WHERE month_year = ? GROUP BY entry_date ORDER BY entry_date',
      [monthYear]
    );
    if (result.length === 0) return [];
    return result[0].values.map(vals => ({
      date: vals[0],
      gross: vals[1],
      net: vals[2]
    }));
  },

  getAgentComparison: (monthYear) => {
    const db = getDb();
    const result = db.exec(
      'SELECT u.id, u.name, u.location, COALESCE(SUM(se.total_sales), 0) as total_gross FROM users u LEFT JOIN sales_entries se ON u.id = se.agent_id AND se.month_year = ? WHERE u.role = ? GROUP BY u.id ORDER BY total_gross DESC',
      [monthYear, 'agent']
    );
    if (result.length === 0) return [];
    return result[0].values.map(vals => ({
      id: vals[0],
      name: vals[1],
      location: vals[2],
      total_gross: vals[3]
    }));
  },

  getWeeklyStats: () => {
    const db = getDb();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const thisWeekStart = startOfWeek.toISOString().split('T')[0];
    const thisWeekEnd = endOfWeek.toISOString().split('T')[0];

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const thisWeek = db.exec(
      'SELECT COALESCE(SUM(total_sales), 0) as gross, COALESCE(SUM(net), 0) as net, COUNT(*) as count FROM sales_entries WHERE entry_date BETWEEN ? AND ?',
      [thisWeekStart, thisWeekEnd]
    );
    const lastWeek = db.exec(
      'SELECT COALESCE(SUM(total_sales), 0) as gross FROM sales_entries WHERE entry_date BETWEEN ? AND ?',
      [lastWeekStart.toISOString().split('T')[0], lastWeekEnd.toISOString().split('T')[0]]
    );

    const thisWeekGross = thisWeek[0].values[0][0];
    const lastWeekGross = lastWeek[0].values[0][0];
    const change = lastWeekGross > 0 ? ((thisWeekGross - lastWeekGross) / lastWeekGross) * 100 : (thisWeekGross > 0 ? 100 : 0);

    return {
      this_week_gross: thisWeekGross,
      this_week_net: thisWeek[0].values[0][1],
      this_week_count: thisWeek[0].values[0][2],
      last_week_gross: lastWeekGross,
      percentage_change: Math.round(change * 10) / 10
    };
  }
};

module.exports = SalesEntry;