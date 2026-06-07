const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const authController = {
  login: (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = User.findByEmail(email);
    if (!user || !User.verifyPassword(user, password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        language: user.language,
        daily_target: user.daily_target,
        commission_rate: user.commission_rate
      }
    });
  },

  me: (req, res) => {
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        language: user.language,
        daily_target: user.daily_target,
        commission_rate: user.commission_rate
      }
    });
  },

  updateProfile: (req, res) => {
    const { name, language } = req.body;
    const updated = User.update(req.user.id, { name, language });
    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        location: updated.location,
        language: updated.language,
        daily_target: updated.daily_target,
        commission_rate: updated.commission_rate
      }
    });
  }
};

module.exports = authController;