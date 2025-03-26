const pool = require('../config/db');

const getUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const getUserById = async (id) => {
  const query = `
    SELECT u.*, d.name as department_name 
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Updated to use name field
const createUser = async (name, email, is_admin, department_id) => {
  const result = await pool.query('INSERT INTO users (name, email, is_admin, department_id) VALUES ($1, $2, $3, $4) RETURNING *', 
    [name, email, is_admin, department_id]);
  return result.rows[0];
};

// Updated to use name field
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

const getUsersByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE department_id = $1',
      [departmentId]
    );
    console.log(`Found ${result.rows.length} users in department ${departmentId}`);
    return result.rows;
  } catch (err) {
    console.error("Error getting users by department:", err);
    return [];
  }
};

// Make sure the getAllUsers function returns all needed user fields
const getAllUsers = async () => {
  const query = `
    SELECT u.*, d.name as department_name 
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserDepartment,
  getUsersByDepartment,
  getAllUsers
};