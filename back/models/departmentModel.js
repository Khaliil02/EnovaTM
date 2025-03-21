const pool = require('../config/db');

// Get all departments
const getDepartments = async () => {
  const result = await pool.query('SELECT * FROM departments');
  return result.rows;
};

// Get department by id
const getDepartmentById = async (id) => {
  const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
  return result.rows[0];
};

// Create a new department
const createDepartment = async (name) => {
  const result = await pool.query('INSERT INTO departments (name) VALUES ($1) RETURNING *', [name]);
  return result.rows[0];
};

// Update department
const updateDepartment = async (id, name) => {
  const result = await pool.query('UPDATE departments SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  return result.rows[0];
};

// Delete department
const deleteDepartment = async (id) => {
  const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
