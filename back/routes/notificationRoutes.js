const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all notifications for the authenticated user
router.get('/', getUserNotifications);

// Get unread notifications for the authenticated user
router.get('/unread', getUnreadNotifications);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

module.exports = router;