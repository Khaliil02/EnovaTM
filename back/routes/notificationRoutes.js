const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Protect all notification routes
router.use(authenticateUser);

// Get all notifications for the current user
router.get('/', notificationController.getNotificationsForUser);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Create a new notification
router.post('/', notificationController.createNotification);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;