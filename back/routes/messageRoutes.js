const express = require('express');
const router = express.Router();
const { sendMessage, getConversation } = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(authenticateUser);

// Send a message
router.post('/', sendMessage);

// Get conversation
router.get('/ticket/:ticketId/user/:userId', getConversation);

module.exports = router;