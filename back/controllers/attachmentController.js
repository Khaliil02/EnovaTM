const path = require('path');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
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

// Update the downloadAttachment function
const downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to download attachment ${id}`);
    
    // Get attachment details
    const attachment = await getAttachmentById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    // Fix the file path to use the actual path stored in the database
    // Instead of trying to resolve it relative to the controller directory
    const filePath = attachment.file_path;
    console.log(`File path: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set Content-Disposition header for download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
    
    // Send the file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).end();
      }
    });
  } catch (err) {
    console.error('Error downloading attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Ensure this function is properly implemented
const viewAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get attachment details
    const attachment = await getAttachmentById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const filePath = attachment.file_path;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set appropriate Content-Type
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_filename}"`);
    
    // Send the file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).end();
      }
    });
  } catch (err) {
    console.error('Error viewing attachment:', err);
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

module.exports = {
  uploadAttachment,
  getTicketAttachments,
  removeAttachment,
  viewAttachment
};