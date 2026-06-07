require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDatabase } = require('./database/init');
const { seedDatabase } = require('./database/seed');

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const entryRoutes = require('./routes/entries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
async function start() {
  await initDatabase();
  seedDatabase();

  // Health check
  app.get('/up', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/entries', entryRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();