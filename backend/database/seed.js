const bcrypt = require('bcryptjs');
const { getDb, saveDatabase } = require('./init');

function seedDatabase() {
  const db = getDb();

  // Only seed if no users exist at all
  const userCount = db.exec('SELECT COUNT(*) as count FROM users');
  const totalUsers = userCount[0].values[0][0];

  if (totalUsers === 0) {
    // Seed shifts
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Midday', '06:00', '12:00', 1]);
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Afternoon', '12:00', '18:00', 2]);
    db.run('INSERT INTO shifts (name, start_time, end_time, "order") VALUES (?, ?, ?, ?)', ['Late', '18:00', '23:59', 3]);

    // Seed admin user
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@wifisales.test', hashedPassword, 'admin']);

    // Seed test agent
    db.run('INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)', ['Test Agent', 'agent@test.com', hashedPassword, 'agent', 'Jinja']);

    saveDatabase();
    console.log('Database seeded with initial data');
  } else {
    console.log('Database already has users, skipping seed');
  }
}

module.exports = { seedDatabase };