const { 
  createMessage, 
  getMessagesByTicketAndUsers, 
  markMessagesAsRead,
  markMessageReadById,
  markAllMessagesByUserAsRead
} = require('../models/messageModel');
const { getTicketById } = require('../models/ticketModel');
const { getUserById } = require('../models/userModel');
const { createNotification } = require('../models/notificationModel');
const db = require('../config/db'); // Add this line to import the database connection

// Send a message
const sendMessage = async (req, res) => {
  try {
    // Extract parameters from request body, supporting both camelCase and snake_case
    const ticketId = req.body.ticketId || req.body.ticket_id;
    const recipientId = req.body.recipientId || req.body.recipient_id;
    const content = req.body.content;
    const senderId = req.user.id;
    
    // Log received data for debugging
    console.log('Message send request:', { ticketId, recipientId, content, senderId });
    
    // Validate input
    if (!ticketId || !recipientId || !content) {
      return res.status(400).json({ error: 'Ticket ID, recipient ID, and message content are required' });
    }
    
    // Check if ticket exists
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if recipient exists
    const recipient = await getUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Check if both users are related to the ticket
    const isRelatedToTicket = await checkUserRelation(senderId, recipientId, ticketId);
    if (!isRelatedToTicket) {
      return res.status(403).json({ error: 'Only users related to the ticket can message each other' });
    }
    
    // Create the message
    const message = await createMessage(ticketId, senderId, recipientId, content);
    
    // Add sender and recipient names for frontend display
    const sender = await getUserById(senderId);
    message.sender_name = sender.name;
    message.recipient_name = recipient.name;
    
    // Create a notification for the recipient
    try {
      const notificationMessage = `New message from ${sender.name} regarding ticket #${ticketId}`;
      const notificationMetadata = { message_id: message.id };
      
      const notification = await createNotification(
        recipientId,
        ticketId,
        notificationMessage,
        'new_message',
        notificationMetadata
      );
      
      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        // Send the message to the recipient
        io.to(`user:${recipientId}`).emit('newMessage', message);
        
        // Also send a notification to alert them
        if (notification) {
          io.to(`user:${recipientId}`).emit('newNotification', notification);
        }
      }
    } catch (notificationError) {
      // Log notification error but don't fail the message sending
      console.error('Error creating notification:', notificationError);
    }
    
    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users for a ticket
const getConversation = async (req, res) => {
  try {
    const { ticketId, userId } = req.params;
    const currentUserId = req.user.id;
    
    // Validate ticket ID
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get messages
    const messages = await getMessagesByTicketAndUsers(ticketId, currentUserId, userId);
    
    // Mark received messages as read
    await markMessagesAsRead(ticketId, userId, currentUserId);
    
    res.json(messages);
  } catch (err) {
    console.error('Error getting conversation:', err);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Check if users are related to the ticket
const checkUserRelation = async (user1Id, user2Id, ticketId) => {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) return false;
    
    // Get user details to check if they're admins or from related departments
    const user1 = await getUserById(user1Id);
    const user2 = await getUserById(user2Id);
    
    if (!user1 || !user2) return false;
    
    // Check if either user is directly related to the ticket
    const directlyRelatedUsers = [
      ticket.created_by,
      ticket.assigned_to
    ].filter(id => id !== null);
    
    const user1DirectlyRelated = directlyRelatedUsers.includes(Number(user1Id));
    const user2DirectlyRelated = directlyRelatedUsers.includes(Number(user2Id));
    
    // If both users are directly related, allow messaging
    if (user1DirectlyRelated && user2DirectlyRelated) return true;
    
    // Check if either user is an admin
    const user1IsAdmin = user1.is_admin === true;
    const user2IsAdmin = user2.is_admin === true;
    
    // If one user is admin and the other is directly related, allow messaging
    if ((user1IsAdmin && user2DirectlyRelated) || (user2IsAdmin && user1DirectlyRelated)) return true;
    
    // Check if users are from departments related to the ticket
    const relatedDepartments = [
      ticket.source_department_id,
      ticket.destination_department_id
    ].filter(id => id !== null);
    
    const user1FromRelatedDept = relatedDepartments.includes(user1.department_id);
    const user2FromRelatedDept = relatedDepartments.includes(user2.department_id);
    
    // If one user is directly related and the other is from a related department
    if ((user1DirectlyRelated && user2FromRelatedDept) || (user2DirectlyRelated && user1FromRelatedDept)) return true;
    
    // If the ticket is escalated, admins can message department users
    if (ticket.status === 'escalated' && ((user1IsAdmin && user2FromRelatedDept) || (user2IsAdmin && user1FromRelatedDept))) return true;
    
    return false;
  } catch (err) {
    console.error('Error checking user relation:', err);
    return false;
  }
};

// Mark a message as read
const markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;
    
    // Mark as read only if user is the recipient
    const result = await markMessageReadById(messageId, userId);
    
    if (!result) {
      return res.status(404).json({ error: 'Message not found or user is not recipient' });
    }
    
    // Notify sender that message is read via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${result.sender_id}`).emit('messagesRead', [messageId]);
    }
    
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Mark all messages as read
const markAllMessagesAsRead = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const senderId = req.params.senderId;
    const recipientId = req.user.id;
    
    // Mark all messages from sender to recipient as read
    const updatedMessages = await markAllMessagesByUserAsRead(ticketId, senderId, recipientId);
    
    if (!updatedMessages || updatedMessages.length === 0) {
      return res.json({ success: true, count: 0 });
    }
    
    // Extract IDs for socket notification
    const messageIds = updatedMessages.map(msg => msg.id);
    
    // Notify sender that messages are read via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${senderId}`).emit('messagesRead', messageIds);
    }
    
    res.json({ success: true, count: messageIds.length });
  } catch (err) {
    console.error('Error marking all messages as read:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Simplified SQL to find all conversations with clearer grouping
    const result = await db.query(
      `WITH latest_messages AS (
         SELECT 
           m.ticket_id,
           CASE 
             WHEN m.sender_id = $1 THEN m.recipient_id 
             ELSE m.sender_id 
           END AS user_id,
           MAX(m.created_at) as latest_time
         FROM ticket_messages m
         WHERE m.sender_id = $1 OR m.recipient_id = $1
         GROUP BY m.ticket_id, user_id
       )
       SELECT 
         l.ticket_id,
         l.user_id,
         u.name as user_name,
         t.title as ticket_subject,
         m.content as last_message,
         m.created_at as last_message_time,
         (SELECT COUNT(*) FROM ticket_messages 
          WHERE recipient_id = $1 
          AND sender_id = l.user_id
          AND ticket_id = l.ticket_id
          AND is_read = false) as unread_count
       FROM latest_messages l
       JOIN users u ON l.user_id = u.id
       JOIN tickets t ON l.ticket_id = t.id
       JOIN ticket_messages m ON m.ticket_id = l.ticket_id 
         AND ((m.sender_id = $1 AND m.recipient_id = l.user_id) OR (m.sender_id = l.user_id AND m.recipient_id = $1))
         AND m.created_at = l.latest_time
       ORDER BY m.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting user conversations:', err);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get specific message by ID
const getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT m.*, 
              t.title as ticket_title,
              u_sender.name as sender_name, 
              u_recipient.name as recipient_name 
       FROM ticket_messages m
       JOIN tickets t ON m.ticket_id = t.id
       JOIN users u_sender ON m.sender_id = u_sender.id
       JOIN users u_recipient ON m.recipient_id = u_recipient.id
       WHERE m.id = $1 AND (m.sender_id = $2 OR m.recipient_id = $2)`,
      [messageId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting message:', err);
    res.status(500).json({ error: 'Failed to get message' });
  }
};

// Get recent messages for dashboard widget
const getRecentMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 5;
    
    const result = await db.query(
      `SELECT m.id, m.ticket_id as "ticketId", m.content, m.created_at,
              m.is_read, u.name as "senderName", t.title as "ticketTitle"
       FROM ticket_messages m
       JOIN users u ON m.sender_id = u.id
       JOIN tickets t ON m.ticket_id = t.id
       WHERE m.recipient_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting recent messages:', err);
    res.status(500).json({ error: 'Failed to get recent messages' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUserConversations,
  getMessageById,
  getRecentMessages
};