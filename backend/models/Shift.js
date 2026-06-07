const { getDb } = require('../database/init');

const Shift = {
  getAll: () => {
    const db = getDb();
    const result = db.exec('SELECT * FROM shifts ORDER BY "order"');
    if (result.length === 0) return [];
    return result[0].values.map(vals => {
      const shift = {};
      result[0].columns.forEach((col, i) => shift[col] = vals[i]);
      return shift;
    });
  },

  findById: (id) => {
    const db = getDb();
    const result = db.exec('SELECT * FROM shifts WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const shift = {};
    cols.forEach((col, i) => shift[col] = vals[i]);
    return shift;
  }
};

module.exports = Shift;