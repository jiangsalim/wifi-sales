const User = require('../models/User');
const SalesEntry = require('../models/SalesEntry');
const Shift = require('../models/Shift');
const { getDb, saveDatabase } = require('../database/init');

const adminController = {
  // Dashboard Stats
  dashboardStats: (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = SalesEntry.getDailyStats(today);
    const weeklyStats = SalesEntry.getWeeklyStats();

    res.json({
      daily: dailyStats,
      weekly: weeklyStats
    });
  },

  // Chart Data
  chartData: (req, res) => {
    const monthYear = req.query.month_year || new Date().toISOString().slice(0, 7);
    const chartData = SalesEntry.getMonthlyData(monthYear);
    const agentComparison = SalesEntry.getAgentComparison(monthYear);

    res.json({
      chart_data: chartData,
      agent_comparison: agentComparison
    });
  },

  // Agent Management
  listAgents: (req, res) => {
    const agents = User.getAllAgents();
    const monthYear = new Date().toISOString().slice(0, 7);

    const agentsWithStats = agents.map(agent => {
      const entries = SalesEntry.getAll({ agent_id: agent.id, dateFrom: monthYear + '-01' });
      const monthlyGross = entries.reduce((sum, e) => sum + e.total_sales, 0);
      const monthlyNet = entries.reduce((sum, e) => sum + e.net, 0);
      const commission = Math.round((monthlyNet * (agent.commission_rate || 0)) / 100);

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        location: agent.location,
        daily_target: agent.daily_target,
        commission_rate: agent.commission_rate,
        language: agent.language,
        is_active: agent.is_active,
        entries_this_month: entries.length,
        monthly_gross: monthlyGross,
        commission,
        created_at: agent.created_at
      };
    });

    res.json({ agents: agentsWithStats });
  },

  createAgent: (req, res) => {
    const { name, email, password, location, daily_target, commission_rate, language } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const agent = User.create({
      name, email, password,
      role: 'agent',
      location: location || null,
      daily_target: daily_target || 0,
      commission_rate: commission_rate || 0,
      language: language || 'en'
    });

    res.status(201).json({
      message: 'Agent created successfully',
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        location: agent.location,
        daily_target: agent.daily_target,
        commission_rate: agent.commission_rate,
        language: agent.language,
        is_active: agent.is_active
      }
    });
  },

  updateAgent: (req, res) => {
    const { id } = req.params;
    const { name, email, password, location, daily_target, commission_rate, language, is_active } = req.body;

    const agent = User.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const updated = User.update(id, {
      name, email, password, location,
      daily_target, commission_rate, language, is_active
    });

    res.json({
      message: 'Agent updated successfully',
      agent: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        location: updated.location,
        daily_target: updated.daily_target,
        commission_rate: updated.commission_rate,
        language: updated.language,
        is_active: updated.is_active
      }
    });
  },

  toggleActive: (req, res) => {
    const { id } = req.params;
    const agent = User.findById(id);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.is_active) {
      User.deactivate(id);
      res.json({ message: 'Agent deactivated', is_active: false });
    } else {
      User.activate(id);
      res.json({ message: 'Agent activated', is_active: true });
    }
  },

  // Sales Entries
  listEntries: (req, res) => {
    const { date_from, date_to, agent_id, shift_id } = req.query;
    const entries = SalesEntry.getAll({ dateFrom: date_from, dateTo: date_to, agent_id, shift_id });

    const shifts = Shift.getAll();
    const enriched = entries.map(entry => ({
      id: entry.id,
      agent_name: entry.agent_name,
      agent_location: entry.agent_location,
      shift_name: entry.shift_name,
      entry_date: entry.entry_date,
      total_sales: entry.total_sales,
      expenses: entry.expenses,
      expense_reason: entry.expense_reason,
      net: entry.net,
      missed_shift_ids: entry.missed_shift_ids,
      submitted_at: entry.submitted_at,
      locked: entry.locked
    }));

    res.json({ entries: enriched });
  },

  // Delete Entry
  deleteEntry: (req, res) => {
    const { id } = req.params;
    const db = getDb();

    const result = db.exec('SELECT * FROM sales_entries WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    db.run('DELETE FROM sales_entries WHERE id = ?', [id]);
    saveDatabase();

    res.json({ message: 'Entry deleted successfully' });
  },

  // CSV Export
  exportCsv: (req, res) => {
    const { date_from, date_to, agent_id } = req.query;
    const entries = SalesEntry.getAll({ dateFrom: date_from, dateTo: date_to, agent_id });

    let csv = 'Agent,Location,Shift,Date,Gross,Expenses,Net,Reason,Combined,Submitted\n';

    entries.forEach(entry => {
      csv += [
        `"${entry.agent_name}"`,
        `"${entry.agent_location || ''}"`,
        `"${entry.shift_name}"`,
        entry.entry_date,
        entry.total_sales,
        entry.expenses,
        entry.net,
        `"${(entry.expense_reason || '').replace(/"/g, '""')}"`,
        entry.missed_shift_ids ? 'Yes' : 'No',
        entry.submitted_at
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }
};

module.exports = adminController;