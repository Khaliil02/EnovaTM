const { 
    getCommentsByTicketId, 
    createComment,
    deleteComment
} = require('../models/commentModel');

const getTicketComments = async (req, res) => {
    // Convert from camelCase parameter to a number (critical)
    const ticketId = parseInt(req.params.ticketId, 10);
    
    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    try {
        const comments = await getCommentsByTicketId(ticketId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addComment = async (req, res) => {
    // Convert from camelCase parameter to a number
    const ticketId = parseInt(req.params.ticketId, 10);
    const { content } = req.body;
    const userId = req.user.id;
    
    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    // Validate input
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    
    try {
        const newComment = await createComment(ticketId, userId, content);
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const removeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    try {
        const deletedComment = await deleteComment(commentId, userId);
        
        if (!deletedComment) {
            return res.status(404).json({ 
                error: 'Comment not found or you do not have permission to delete it' 
            });
        }
        
        res.json(deletedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add this function to createComment
const notifyAboutComment = async (req, comment, ticket) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name || 'Unknown User';
    
    // Notify ticket owner if different from commenter
    if (ticket.created_by && ticket.created_by !== userId) {
      const notification = {
        user_id: ticket.created_by,
        message: `${userName} commented on ticket #${ticket.id}`,
        ticket_id: ticket.id
      };
      
      await createNotificationAndEmit(req, notification);
    }
    
    // Notify assigned user if different from commenter
    if (ticket.assigned_to && ticket.assigned_to !== userId && ticket.assigned_to !== ticket.created_by) {
      const notification = {
        user_id: ticket.assigned_to,
        message: `${userName} commented on ticket #${ticket.id} assigned to you`,
        ticket_id: ticket.id
      };
      
      await createNotificationAndEmit(req, notification);
    }
  } catch (error) {
    console.error('Error sending comment notifications:', error);
    // Don't throw - notifications are secondary to comment creation
  }
};

// Helper function to create notification and emit via socket
const createNotificationAndEmit = async (req, notificationData) => {
  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, message, ticket_id, is_read, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING *`,
      [notificationData.user_id, notificationData.message, notificationData.ticket_id]
    );
    
    const notification = result.rows[0];
    
    // Add ticket title for frontend display
    if (notificationData.ticket_id) {
      const ticketResult = await db.query(
        'SELECT title FROM tickets WHERE id = $1',
        [notificationData.ticket_id]
      );
      
      if (ticketResult.rows.length > 0) {
        notification.ticket_title = ticketResult.rows[0].title;
      }
    }
    
    // Emit via socket
    req.app.get('sendNotification')(notificationData.user_id, notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
    getTicketComments,
    addComment,
    removeComment
};