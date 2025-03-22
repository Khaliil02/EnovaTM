const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../models/userModel');
const pool = require('../config/db'); // Add this import

const getAllUsers = async (req, res) => {
  try {
    // Option 1: Use the model function if it returns the right data
    const users = await getUsers();
    res.json(users);
    
    // OR Option 2: Keep the direct query if needed
    /*
    const query = `
      SELECT u.*, d.name as department_name 
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    */
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: err.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addUser = async (req, res) => {
  const { name, email, is_admin, department_id } = req.body;
  
  // Add validation for department_id
  if (!name || !email || department_id === undefined || department_id === null) {
    return res.status(400).json({ error: 'Missing required fields. Name, email, and department_id are required.' });
  }
  
  try {
    const newUser = await createUser(name, email, is_admin, department_id);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const modifyUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, is_admin, department_id } = req.body;
  try {
    const updatedUser = await updateUser(id, name, email, is_admin, department_id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  modifyUser,
  removeUser,
};
