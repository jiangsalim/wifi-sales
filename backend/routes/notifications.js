const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.list);
router.get('/unread-count', auth, notificationController.unreadCount);
router.put('/:id/read', auth, notificationController.markRead);
router.put('/read-all', auth, notificationController.markAllRead);

module.exports = router;