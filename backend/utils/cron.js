const cron = require('node-cron');
const Shift = require('../models/Shift');
const User = require('../models/User');
const SalesEntry = require('../models/SalesEntry');
const Notification = require('../models/Notification');
const { getDb } = require('../database/init');

function startCronJobs() {
  // Lock missed shifts - runs every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const today = now.toISOString().split('T')[0];

    const allShifts = Shift.getAll();
    const expiredShifts = allShifts.filter(s => s.end_time <= currentTime);

    const agents = User.getAllAgents().filter(a => a.is_active);

    expiredShifts.forEach(shift => {
      agents.forEach(agent => {
        const entry = SalesEntry.findByAgentAndShiftAndDate(agent.id, shift.id, today);
        if (!entry) {
          // Check if already notified
          const db = getDb();
          const notified = db.exec(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND type = 'missed_shift' AND json_extract(data, '$.shift_id') = ? AND date(created_at) = ?",
            [agent.id, shift.id, today]
          );

          const alreadyNotified = notified.length > 0 && notified[0].values[0][0] > 0;

          if (!alreadyNotified) {
            Notification.create(
              agent.id,
              'missed_shift',
              `${shift.name} Shift Missed`,
              `You missed the ${shift.name} shift (${shift.start_time} - ${shift.end_time}). Combine sales in the next available shift.`,
              { shift_id: shift.id, shift_name: shift.name, date: today }
            );
          }
        }
      });
    });

    console.log(`[${new Date().toISOString()}] Missed shift check completed`);
  });

  // Daily review reminder - 9 PM
  cron.schedule('0 21 * * *', () => {
    const today = new Date().toISOString().split('T')[0];
    const agents = User.getAllAgents().filter(a => a.is_active);
    const admins = User.getAllAgents().filter(a => a.role === 'admin');

    // Get admins properly
    const db = getDb();
    const adminResult = db.exec("SELECT * FROM users WHERE role = 'admin'");
    const adminUsers = adminResult.length > 0 ? adminResult[0].values.map(vals => {
      const u = {};
      adminResult[0].columns.forEach((col, i) => u[col] = vals[i]);
      return u;
    }) : [];

    const dailyStats = SalesEntry.getDailyStats(today);
    const submittedAgents = SalesEntry.getAll({ dateFrom: today, dateTo: today });
    const submittedAgentIds = [...new Set(submittedAgents.map(e => e.agent_id))];
    const missedCount = agents.filter(a => !submittedAgentIds.includes(a.id)).length;

    adminUsers.forEach(admin => {
      Notification.create(
        admin.id,
        'review_reminder',
        'Daily Review',
        `${submittedAgentIds.length} of ${agents.length} agents submitted today. ${missedCount} agents missed.`
      );
    });

    console.log(`[${new Date().toISOString()}] Daily review reminder sent`);
  });

  // Shift reminders - 30 minutes before each shift
  cron.schedule('*/5 * * * *', () => {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60000);
    const reminderTimeStr = reminderTime.getHours().toString().padStart(2, '0') + ':' + reminderTime.getMinutes().toString().padStart(2, '0') + ':00';

    const allShifts = Shift.getAll();
    const upcomingShifts = allShifts.filter(s => s.start_time === reminderTimeStr);

    if (upcomingShifts.length === 0) return;

    const today = now.toISOString().split('T')[0];
    const agents = User.getAllAgents().filter(a => a.is_active);

    upcomingShifts.forEach(shift => {
      agents.forEach(agent => {
        const db = getDb();
        const notified = db.exec(
          "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND type = 'shift_reminder' AND json_extract(data, '$.shift_id') = ? AND date(created_at) = ?",
          [agent.id, shift.id, today]
        );

        const alreadyNotified = notified.length > 0 && notified[0].values[0][0] > 0;

        if (!alreadyNotified) {
          Notification.create(
            agent.id,
            'shift_reminder',
            `${shift.name} Shift Reminder`,
            `${shift.name} shift starts in 30 minutes (${shift.start_time}). Be ready to submit your sales!`,
            { shift_id: shift.id, shift_name: shift.name }
          );
        }
      });
    });

    console.log(`[${new Date().toISOString()}] Shift reminders sent for: ${upcomingShifts.map(s => s.name).join(', ')}`);
  });

  console.log('Cron jobs started');
}

module.exports = { startCronJobs };