const Notification = require('../models/Notification');

const notificationController = {
  list: (req, res) => {
    const { page = 1, per_page = 20 } = req.query;
    const result = Notification.getByUser(req.user.id, parseInt(page), parseInt(per_page));

    res.json({
      notifications: result.notifications,
      total: result.total,
      page: result.page,
      per_page: result.perPage
    });
  },

  unreadCount: (req, res) => {
    const count = Notification.unreadCount(req.user.id);
    res.json({ count });
  },

  markRead: (req, res) => {
    const { id } = req.params;
    Notification.markRead(id, req.user.id);
    res.json({ message: 'Marked as read' });
  },

  markAllRead: (req, res) => {
    Notification.markAllRead(req.user.id);
    res.json({ message: 'All marked as read' });
  }
};

module.exports = notificationController;