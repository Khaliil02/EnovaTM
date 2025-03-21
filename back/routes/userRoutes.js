const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  addUser,
  modifyUser,
  removeUser,
} = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);

// Get a user by ID
router.get('/:id', getUser);

// Create a new user
router.post('/', addUser);

// Update a user
router.put('/:id', modifyUser);

// Delete a user
router.delete('/:id', removeUser);

module.exports = router;

