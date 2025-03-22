const express = require('express');
const router = express.Router();
const upload = require('../config/uploadConfig');
const {
  uploadAttachment,
  getTicketAttachments,
  downloadAttachment,
  removeAttachment
} = require('../controllers/attachmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication to most routes
router.use(authenticateUser);

// Override authentication for download route
router.get('/:id/download', authenticateUser, downloadAttachment);

// Get all attachments for a ticket
router.get('/ticket/:ticketId', getTicketAttachments);

// Upload attachment to a ticket
router.post('/ticket/:ticketId', upload.single('file'), uploadAttachment);

// Delete an attachment
router.delete('/:id', removeAttachment);

module.exports = router;