const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getConversation, 
  markMessageAsRead, 
  markAllMessagesAsRead, 
  getUserConversations,
  getMessageById,
  getRecentMessages
} = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(authenticateUser);

// Send a message
router.post('/', sendMessage);

// Get conversation
router.get('/ticket/:ticketId/user/:userId', getConversation);

// Get all user conversations (inbox)
router.get('/conversations', getUserConversations);

// Get recent messages for dashboard
router.get('/recent', getRecentMessages);

// Get a specific message by ID
router.get('/:id', getMessageById);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

// Mark all messages as read
router.put('/ticket/:ticketId/user/:senderId/read-all', markAllMessagesAsRead);

module.exports = router;