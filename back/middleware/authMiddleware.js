const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is properly set
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateUser = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Get token
    const token = authHeader.split(' ')[1];
    
    // Verify token using the correct secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add this middleware for handling attachment downloads
const authenticateDownload = (req, res, next) => {
  // Get token from query parameter
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using the same JWT_SECRET used in authenticateUser
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

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
  authenticateAdmin,
  authenticateDownload
};