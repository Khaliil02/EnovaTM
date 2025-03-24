const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../models/userModel');
const db = require('../config/db'); // Fix variable name to match usage

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

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating profile for user ID:', id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Ensure user can only modify their own profile unless admin
    if (req.user.id !== parseInt(id) && !req.user.is_admin) {
      return res.status(403).json({ error: 'Unauthorized to edit this profile' });
    }
    
    // Get basic profile data and preferences
    const { first_name, last_name, email, phone, preferences } = req.body;
    console.log('Preferences received:', preferences);
    
    // Parse preferences if it's a string
    let parsedPreferences = preferences;
    if (preferences && typeof preferences === 'string') {
      try {
        parsedPreferences = JSON.parse(preferences);
        console.log('Parsed preferences:', parsedPreferences);
      } catch (err) {
        console.error('Error parsing preferences:', err);
      }
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update basic profile info
      const updateQuery = `
        UPDATE users 
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          preferences = COALESCE($5, preferences),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      
      const values = [
        first_name || null,
        last_name || null,
        email || null,
        phone || null,
        parsedPreferences || null,
        id
      ];
      
      const result = await client.query(updateQuery, values);
      
      // Handle avatar upload if exists
      if (req.file) {
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        await client.query(
          'UPDATE users SET avatar_url = $1 WHERE id = $2',
          [avatarPath, id]
        );
        
        // Add avatar URL to returned user
        result.rows[0].avatar_url = avatarPath;
      }
      
      await client.query('COMMIT');
      
      // Return updated user
      delete result.rows[0].password; // Don't return password
      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  modifyUser,
  removeUser,
  updateUserProfile  // Add this line
};
