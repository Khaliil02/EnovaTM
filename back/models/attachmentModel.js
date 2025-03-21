const pool = require('../config/db');
const path = require('path');

const createAttachment = async (ticketId, filename, originalFilename, filePath, fileSize, mimeType, userId) => {
  const query = `
    INSERT INTO attachments (ticket_id, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [ticketId, filename, originalFilename, filePath, fileSize, mimeType, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAttachmentsByTicketId = async (ticketId) => {
  const query = `
    SELECT * FROM attachments 
    WHERE ticket_id = $1
    ORDER BY upload_date DESC
  `;
  
  const result = await pool.query(query, [ticketId]);
  return result.rows;
};

const getAttachmentById = async (id) => {
  const query = 'SELECT * FROM attachments WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const deleteAttachment = async (id) => {
  const query = 'DELETE FROM attachments WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createAttachment,
  getAttachmentsByTicketId,
  getAttachmentById,
  deleteAttachment
};