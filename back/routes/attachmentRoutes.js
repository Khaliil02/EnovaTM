const express = require('express');
const router = express.Router();
const upload = require('../config/uploadConfig');
const {
  uploadAttachment,
  getTicketAttachments,
  removeAttachment,
  viewAttachment
} = require('../controllers/attachmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication to specific routes
router.get('/ticket/:ticketId', authenticateUser, getTicketAttachments);
router.post('/ticket/:ticketId', authenticateUser, upload.single('file'), uploadAttachment);
router.delete('/:id', authenticateUser, removeAttachment);

// Make viewing attachments public or use token from headers
router.get('/:id/view', viewAttachment);

module.exports = router;