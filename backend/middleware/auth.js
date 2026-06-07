const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const user = User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: 'Account is inactive' });
  }

  req.user = user;
  next();
}

module.exports = auth;