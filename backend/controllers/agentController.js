const Shift = require('../models/Shift');
const SalesEntry = require('../models/SalesEntry');
const { getDb } = require('../database/init');

const agentController = {
  getTodayShifts: (req, res) => {
    const agent = req.user;
    const allShifts = Shift.getAll();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const todayEntries = SalesEntry.getAll({ agent_id: agent.id, dateFrom: today, dateTo: today });

    const shifts = allShifts.map(shift => {
      const entry = todayEntries.find(e => e.shift_id === shift.id);

      if (entry) {
        return {
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          order: shift.order,
          status: 'submitted',
          submitted_at: entry.submitted_at,
          gross: entry.total_sales
        };
      }

      if (currentTime > shift.end_time) {
        return {
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          order: shift.order,
          status: 'missed',
          submitted_at: null,
          gross: null
        };
      }

      return {
        id: shift.id,
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        order: shift.order,
        status: 'open',
        submitted_at: null,
        gross: null
      };
    });

    const todayTotal = todayEntries.reduce((sum, e) => sum + e.total_sales, 0);
    const target = agent.daily_target || 0;
    const percentage = target > 0 ? Math.min(Math.round((todayTotal / target) * 100), 100) : 0;

    res.json({
      shifts,
      today_total: todayTotal,
      daily_target: target,
      percentage
    });
  },

  getCommission: (req, res) => {
    const agent = req.user;
    const monthYear = new Date().toISOString().slice(0, 7);
    const entries = SalesEntry.getAll({ agent_id: agent.id, dateFrom: monthYear + '-01' });

    const monthlyNet = entries.reduce((sum, e) => sum + e.net, 0);
    const commission = Math.round((monthlyNet * (agent.commission_rate || 0)) / 100);

    res.json({
      commission_rate: agent.commission_rate || 0,
      commission,
      month_year: monthYear
    });
  },

  // Lifetime Totals (Permanent - Never Resets)
  getTotals: (req, res) => {
    const db = getDb();
    const agent = req.user;

    const result = db.exec(
      `SELECT 
        COALESCE(SUM(total_sales), 0) as total_gross,
        COALESCE(SUM(expenses), 0) as total_expenses,
        COALESCE(SUM(net), 0) as total_net,
        COUNT(*) as total_entries
      FROM sales_entries WHERE agent_id = ?`,
      [agent.id]
    );

    const vals = result[0].values[0];

    res.json({
      total_gross: vals[0],
      total_expenses: vals[1],
      total_net: vals[2],
      total_entries: vals[3]
    });
  }
};

module.exports = agentController;