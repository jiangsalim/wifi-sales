const SalesEntry = require('../models/SalesEntry');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification');
const User = require('../models/User');

const entryController = {
  submit: (req, res) => {
    const agent = req.user;
    const { shift_id, total_sales, expenses, expense_reason } = req.body;

    if (!shift_id || total_sales === undefined) {
      return res.status(400).json({ message: 'Shift ID and total sales are required' });
    }

    if (expenses > 0 && !expense_reason) {
      return res.status(400).json({ message: 'Expense reason is required when expenses are greater than 0' });
    }

    const shift = Shift.findById(shift_id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check duplicate
    const existing = SalesEntry.findByAgentAndShiftAndDate(agent.id, shift_id, today);
    if (existing) {
      return res.status(409).json({ message: 'This shift has already been submitted for today.' });
    }

    // Find missed shifts
    const allShifts = Shift.getAll();
    const earlierShifts = allShifts.filter(s => s.order < shift.order);
    const todayEntries = SalesEntry.getAll({ agent_id: agent.id, dateFrom: today, dateTo: today });
    const submittedShiftIds = todayEntries.map(e => e.shift_id);
    const missedShiftIds = earlierShifts.filter(s => !submittedShiftIds.includes(s.id)).map(s => s.id);

    const exp = expenses || 0;
    const net = total_sales - exp;
    const monthYear = today.slice(0, 7);

    const entry = SalesEntry.create({
      agent_id: agent.id,
      shift_id,
      entry_date: today,
      total_sales,
      expenses: exp,
      expense_reason: exp > 0 ? expense_reason : null,
      net,
      missed_shift_ids: missedShiftIds.length > 0 ? missedShiftIds : null,
      month_year: monthYear
    });

    // Notify all admins
    const admins = User.getAllAgents ? User.getAllAgents().filter(u => u.role === 'admin') : [];
    // Get admins properly
    const { getDb } = require('../database/init');
    const db = getDb();
    const adminResult = db.exec("SELECT * FROM users WHERE role = 'admin'");
    const adminUsers = adminResult.length > 0 ? adminResult[0].values.map(vals => {
      const u = {};
      adminResult[0].columns.forEach((col, i) => u[col] = vals[i]);
      return u;
    }) : [];

    adminUsers.forEach(admin => {
      Notification.create(
        admin.id,
        'submission',
        'New Submission',
        `${agent.name} (${agent.location || 'N/A'}) submitted ${shift.name} shift: UGX ${total_sales.toLocaleString()}`
      );
    });

    res.status(201).json({
      message: 'Entry submitted successfully. This cannot be edited.',
      entry: {
        id: entry.id,
        shift: shift.name,
        total_sales,
        expenses: exp,
        net,
        missed_shift_ids: missedShiftIds.length > 0 ? missedShiftIds : null,
        submitted_at: entry.submitted_at
      }
    });
  },

  history: (req, res) => {
    const agent = req.user;
    const { date_from, date_to, page = 1, per_page = 15 } = req.query;

    const result = SalesEntry.getByAgent(agent.id, date_from, date_to, parseInt(page), parseInt(per_page));

    // Enrich with shift names
    const allShifts = Shift.getAll();
    const entries = result.entries.map(entry => {
      const shift = allShifts.find(s => s.id === entry.shift_id);
      return {
        ...entry,
        shift_name: shift ? shift.name : 'Unknown',
        missed_shift_ids: entry.missed_shift_ids || null
      };
    });

    res.json({
      entries,
      total: result.total,
      page: result.page,
      per_page: result.perPage,
      total_pages: Math.ceil(result.total / result.perPage)
    });
  },

  getOne: (req, res) => {
    const agent = req.user;
    const { id } = req.params;

    const today = new Date().toISOString().split('T')[0];
    const entries = SalesEntry.getAll({ agent_id: agent.id });
    const entry = entries.find(e => e.id === parseInt(id));

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const shift = Shift.findById(entry.shift_id);
    res.json({
      entry: {
        ...entry,
        shift_name: shift ? shift.name : 'Unknown'
      }
    });
  }
};

module.exports = entryController;