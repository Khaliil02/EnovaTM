const express = require('express');
const router = express.Router();
const { 
    getTicketComments,
    addComment,
    removeComment
} = require('../controllers/commentController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { canAddComment } = require('../middleware/commentMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get comments for a ticket
router.get('/ticket/:ticketId', getTicketComments);

// Add a comment to a ticket (with permission check)
router.post('/ticket/:ticketId', canAddComment, addComment);

// Delete a comment (only by the author)
router.delete('/:commentId', removeComment);

module.exports = router;