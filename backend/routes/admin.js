const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const adminController = require('../controllers/adminController');

router.get('/dashboard/stats', auth, role('admin'), adminController.dashboardStats);
router.get('/dashboard/charts', auth, role('admin'), adminController.chartData);
router.get('/agents', auth, role('admin'), adminController.listAgents);
router.post('/agents', auth, role('admin'), adminController.createAgent);
router.put('/agents/:id', auth, role('admin'), adminController.updateAgent);
router.put('/agents/:id/toggle-active', auth, role('admin'), adminController.toggleActive);
router.get('/entries', auth, role('admin'), adminController.listEntries);
router.get('/export/csv', auth, role('admin'), adminController.exportCsv);
router.delete('/entries/:id', auth, role('admin'), adminController.deleteEntry);

module.exports = router;