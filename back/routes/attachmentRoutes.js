const express = require('express');
const router = express.Router();
const upload = require('../config/uploadConfig');
const {
  uploadAttachment,
  getTicketAttachments,
  downloadAttachment,
  removeAttachment
} = require('../controllers/attachmentController');
const { authenticateUser, authenticateDownload } = require('../middleware/authMiddleware');

// Apply authentication to most routes
router.use(authenticateUser);
router.get('/ticket/:ticketId', getTicketAttachments);
router.post('/ticket/:ticketId', upload.single('file'), uploadAttachment);
router.delete('/:id', removeAttachment);

// Special route for downloads that needs query param authentication
router.get('/:id/download', authenticateDownload, downloadAttachment);

module.exports = router;