const jwt = require('jsonwebtoken');

// Use a proper environment variable with fallback
const JWT_SECRET = process.env.JWT_SECRET;

// Add console warning if using fallback secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your_jwt_secret_key') {
  console.warn('Warning: Using default JWT secret in production!');
}

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create a separate middleware for attachment download that supports query tokens
const authenticateDownload = (req, res, next) => {
  // Get token from query parameter
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check for admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateUser,
  authenticateDownload,
  requireAdmin
};