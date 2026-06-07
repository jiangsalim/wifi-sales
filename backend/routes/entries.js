const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { submissionLimiter } = require('../middleware/rateLimiter');
const entryController = require('../controllers/entryController');

router.post('/', auth, role('agent'), submissionLimiter, entryController.submit);
router.get('/', auth, role('agent'), entryController.history);
router.get('/:id', auth, role('agent'), entryController.getOne);

module.exports = router;