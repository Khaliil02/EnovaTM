const express = require('express');
const router = express.Router();
const upload = require('../config/uploadConfig');
const {
  uploadAttachment,
  getTicketAttachments,
  removeAttachment,
  getAttachmentFile
} = require('../controllers/attachmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(authenticateUser);
router.get('/ticket/:ticketId', getTicketAttachments);
router.post('/ticket/:ticketId', upload.single('file'), uploadAttachment);
router.delete('/:id', removeAttachment);
router.get('/:id/view', getAttachmentFile); // Add this new route

module.exports = router;