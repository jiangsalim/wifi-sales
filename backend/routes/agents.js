const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const agentController = require('../controllers/agentController');

router.get('/shifts/today', auth, role('agent'), agentController.getTodayShifts);
router.get('/commission', auth, role('agent'), agentController.getCommission);

module.exports = router;