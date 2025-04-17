const db = require('../config/db');

const createMessage = async (ticketId, senderId, recipientId, content) => {
  const result = await db.query(
    `INSERT INTO ticket_messages 
     (ticket_id, sender_id, recipient_id, content, created_at) 
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [ticketId, senderId, recipientId, content]
  );
  
  return result.rows[0];
};

const getMessagesByTicketAndUsers = async (ticketId, user1Id, user2Id) => {
  const result = await db.query(
    `SELECT m.*, 
            u1.name as sender_name, 
            u2.name as recipient_name 
     FROM ticket_messages m
     JOIN users u1 ON m.sender_id = u1.id
     JOIN users u2 ON m.recipient_id = u2.id
     WHERE m.ticket_id = $1
     AND ((m.sender_id = $2 AND m.recipient_id = $3)
          OR (m.sender_id = $3 AND m.recipient_id = $2))
     ORDER BY m.created_at ASC`,
    [ticketId, user1Id, user2Id]
  );
  
  return result.rows;
};

const markMessagesAsRead = async (ticketId, senderId, recipientId) => {
  const result = await db.query(
    `UPDATE ticket_messages
     SET is_read = true
     WHERE ticket_id = $1
     AND sender_id = $2
     AND recipient_id = $3
     AND is_read = false
     RETURNING *`,
    [ticketId, senderId, recipientId]
  );
  
  return result.rows;
};

const markMessageReadById = async (messageId, recipientId) => {
  const result = await db.query(
    `UPDATE ticket_messages
     SET is_read = true
     WHERE id = $1
     AND recipient_id = $2
     AND is_read = false
     RETURNING *`,
    [messageId, recipientId]
  );
  
  return result.rows[0];
};

const markAllMessagesByUserAsRead = async (ticketId, senderId, recipientId) => {
  const result = await db.query(
    `UPDATE ticket_messages
     SET is_read = true
     WHERE ticket_id = $1
     AND sender_id = $2
     AND recipient_id = $3
     AND is_read = false
     RETURNING *`,
    [ticketId, senderId, recipientId]
  );
  
  return result.rows;
};

module.exports = {
  createMessage,
  getMessagesByTicketAndUsers,
  markMessagesAsRead,
  markMessageReadById,
  markAllMessagesByUserAsRead
};