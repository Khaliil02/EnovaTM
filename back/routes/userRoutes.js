const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllUsers,
  getUser,
  addUser,
  modifyUser,
  removeUser,
  updateUserProfile
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Use authentication middleware for protected routes
router.use(authenticateUser);

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

// Update user profile with avatar support
router.put('/:id/profile', upload.single('avatar'), updateUserProfile);

// Serve avatar files
router.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

module.exports = router;

