const path = require('path');
const fs = require('fs-extra');
const {
  createAttachment,
  getAttachmentsByTicketId,
  getAttachmentById,
  deleteAttachment
} = require('../models/attachmentModel');
const { getTicketById } = require('../models/ticketModel');

// Upload a file attachment for a ticket
const uploadAttachment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    
    // Check if ticket exists
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Process uploaded file (multer middleware already saved the file)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    
    // Save attachment to database
    const attachment = await createAttachment(
      ticketId,
      filename,
      originalname,
      filePath,
      size,
      mimetype,
      userId
    );
    
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all attachments for a ticket
const getTicketAttachments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Check if ticket exists
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const attachments = await getAttachmentsByTicketId(ticketId);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an attachment
const removeAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get attachment details
    const attachment = await getAttachmentById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    // Get ticket details to check permissions
    const ticket = await getTicketById(attachment.ticket_id);
    
    // Check permissions: only ticket creator, assignee, or admin can delete
    const isCreator = ticket.created_by === userId;
    const isAssignee = ticket.assigned_to === userId;
    const isAdmin = req.user.is_admin;
    
    if (!isCreator && !isAssignee && !isAdmin) {
      return res.status(403).json({
        error: 'You do not have permission to delete this attachment'
      });
    }
    
    // Delete from database
    const deletedAttachment = await deleteAttachment(id);
    
    // Delete file from storage
    if (fs.existsSync(deletedAttachment.file_path)) {
      fs.unlinkSync(deletedAttachment.file_path);
    }
    
    res.json(deletedAttachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View an attachment file in the browser
const getAttachmentFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get attachment details
    const attachment = await getAttachmentById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    // Check if file exists
    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set content type header based on the file's mime type
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_filename}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(attachment.file_path);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadAttachment,
  getTicketAttachments,
  removeAttachment,
  getAttachmentFile
};