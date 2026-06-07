const bcrypt = require('bcryptjs');
const { getDb, saveDatabase } = require('./init');

function seedDatabase() {
  const db = getDb();

  // Seed shifts
  const shiftCount = db.exec('SELECT COUNT(*) as count FROM shifts');
  if (shiftCount[0].values[0][0] === 0) {
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Midday', '06:00', '12:00', 1]);
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Afternoon', '12:00', '18:00', 2]);
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Late', '18:00', '23:59', 3]);
    console.log('Shifts seeded');
  }

  // Seed admin user
  const adminCheck = db.exec("SELECT COUNT(*) as count FROM users WHERE email = 'admin@wifisales.test'");
  if (adminCheck[0].values[0][0] === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@wifisales.test', hashedPassword, 'admin']);
    console.log('Admin user seeded');
  }

  // Seed test agent
  const agentCheck = db.exec("SELECT COUNT(*) as count FROM users WHERE email = 'agent@test.com'");
  if (agentCheck[0].values[0][0] === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.run('INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)', ['Test Agent', 'agent@test.com', hashedPassword, 'agent', 'Jinja']);
    console.log('Test agent seeded');
  }

  saveDatabase();
}

module.exports = { seedDatabase };