const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/userModel'); // Add this import

// Ensure JWT_SECRET is properly set
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateUser = async (req, res, next) => {
  try {
    // Check for token in headers or query params for attachment viewing
    const token = 
      req.headers.authorization?.split(' ')[1] || 
      req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// We can remove this middleware since we're not using it anymore
// const authenticateDownload = (req, res, next) => { ... };

const authenticateAdmin = (req, res, next) => {
  // First authenticate the user
  authenticateUser(req, res, () => {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

module.exports = {
  authenticateUser,
  authenticateAdmin
  // Remove authenticateDownload from exports
};