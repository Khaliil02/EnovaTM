const jwt = require('jsonwebtoken');
const { findUserByEmail, registerUser, comparePassword } = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRY = '24h';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Log authentication attempt (without password)
    console.log(`Login attempt for user: ${email}`);
    
    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
        department_id: user.department_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const register = async (req, res) => {
  const { name, email, password, department_id, is_admin } = req.body;

  // Validate input
  if (!name || !email || !password || !department_id) {
    return res.status(400).json({ 
      error: 'Name, email, password, and department_id are required' 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Register new user
    const newUser = await registerUser(name, email, password, department_id, is_admin);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Return token and user info
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_admin: newUser.is_admin,
        department_id: newUser.department_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
  register
};