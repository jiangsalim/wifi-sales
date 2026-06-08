const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, authController.login);
router.get('/me', auth, authController.me);
router.put('/profile', auth, authController.updateProfile);
router.put('/avatar', auth, authController.updateAvatar);

module.exports = router;