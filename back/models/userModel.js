const pool = require('../config/db');

const getUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// Corrected implementation
const createUser = async (name, email, is_admin, department_id) => {
  const result = await pool.query('INSERT INTO users (name, email, is_admin, department_id) VALUES ($1, $2, $3, $4) RETURNING *', 
    [name, email, is_admin, department_id]);
  return result.rows[0];
};

// Corrected implementation
const updateUser = async (id, name, email, is_admin, department_id) => {
  const result = await pool.query('UPDATE users SET name = $1, email = $2, is_admin = $3, department_id = $4 WHERE id = $5 RETURNING *', 
    [name, email, is_admin, department_id, id]);
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

const getUserDepartment = async (userId) => {
  const result = await pool.query('SELECT department_id FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const departmentId = result.rows[0].department_id;
  if (departmentId === null) {
    throw new Error('User does not have an assigned department. Cannot create ticket.');
  }
  
  return departmentId;
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserDepartment
};