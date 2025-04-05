const { 
  createMessage, 
  getMessagesByTicketAndUsers, 
  markMessagesAsRead 
} = require('../models/messageModel');
const { getTicketById } = require('../models/ticketModel');
const { getUserById } = require('../models/userModel');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { ticketId, recipientId, content } = req.body;
    const senderId = req.user.id;
    
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
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${recipientId}`).emit('newMessage', message);
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

module.exports = {
  sendMessage,
  getConversation
};