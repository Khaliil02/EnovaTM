const pool = require('../config/db');
const bcrypt = require('bcrypt');

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const registerUser = async (name, email, password, department_id, is_admin = false) => {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user into database
  const result = await pool.query(
    'INSERT INTO users (name, email, password, department_id, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, is_admin, department_id',
    [name, email, hashedPassword, department_id, is_admin]
  );

  return result.rows[0];
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  findUserByEmail,
  registerUser,
  comparePassword
};