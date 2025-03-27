const db = require('../config/db');

const { 
  createNotification,
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../models/notificationModel');

const { getTicketById } = require('../models/ticketModel');
const { getUserById, getUsersByDepartment } = require('../models/userModel');
const { sendNotificationEmail } = require('../services/emailService'); // Add this import
const { getDepartmentById } = require('../models/departmentModel'); // Add this import

// Add this helper function
const getDepartmentName = async (departmentId) => {
  try {
    const department = await getDepartmentById(departmentId);
    return department ? department.name : 'Unknown Department';
  } catch (error) {
    console.error('Error getting department name:', error);
    return 'Unknown Department';
  }
};

// Determine who should get notifications for a ticket
const getTicketStakeholders = async (ticketId) => {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) return [];
    
    const stakeholderIds = new Set();
    
    // Add ticket creator
    if (ticket.created_by) stakeholderIds.add(ticket.created_by);
    
    // Add assigned user if any
    if (ticket.assigned_to) stakeholderIds.add(ticket.assigned_to);
    
    // Add all users from destination department
    if (ticket.destination_department_id) {
      const departmentUsers = await getUsersByDepartment(ticket.destination_department_id);
      departmentUsers.forEach(user => stakeholderIds.add(user.id));
    }
    
    return [...stakeholderIds];
  } catch (error) {
    console.error('Error getting ticket stakeholders:', error);
    return [];
  }
};

// Update this function to send emails
const createTicketStatusNotification = async (ticketId, oldStatus, newStatus, updatedBy, io = null) => {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    const stakeholderIds = await getTicketStakeholders(ticketId);
    
    // Don't notify the user who made the change
    const recipientIds = stakeholderIds.filter(id => id != updatedBy);
    
    const message = `Ticket "${ticket.title}" status changed from ${oldStatus} to ${newStatus}`;
    
    // Create notifications for each recipient
    const notifications = [];
    for (const userId of recipientIds) {
      const notification = await createNotification(
        userId, 
        ticketId,
        message,
        'status_change'
      );
      notifications.push(notification);
      
      // Emit new notification event
      if (io) {
        io.to(`user:${userId}`).emit('newNotification', notification);
      }
      
      // Send email notification
      try {
        // Get user email
        const user = await getUserById(userId);
        if (user && user.email) {
          await sendNotificationEmail(
            user.email,
            `Ticket Status Update: ${ticket.title}`,
            message,
            ticketId
          );
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Continue even if email fails - notifications shouldn't break the app
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating status notification:', error);
    throw error;
  }
};

// Modify the createNewTicketNotification function to send emails
const createNewTicketNotification = async (ticketId, createdBy, io = null) => {
  try {
    console.log(`Creating notifications for new ticket ${ticketId} by user ${createdBy}`);
    
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      console.log('Ticket not found');
      throw new Error('Ticket not found');
    }
    
    const stakeholderIds = await getTicketStakeholders(ticketId);
    console.log('All stakeholders:', stakeholderIds);
    
    // Don't notify the creator
    const recipientIds = stakeholderIds.filter(id => id != createdBy);
    console.log('Notification recipients:', recipientIds);
    
    if (recipientIds.length === 0) {
      console.log('No recipients to notify');
      return [];
    }
    
    const message = `New ticket created: "${ticket.title}"`;
    
    // Create notifications for each recipient
    const notifications = [];
    for (const userId of recipientIds) {
      console.log(`Creating notification for user ${userId}`);
      const notification = await createNotification(
        userId, 
        ticketId,
        message,
        'new_ticket'
      );
      notifications.push(notification);
      
      // Emit to socket if available
      if (io) {
        console.log(`Emitting notification to user:${userId}`);
        io.to(`user:${userId}`).emit('newNotification', notification);
      } else {
        console.log('Socket.io not available for real-time notification');
      }
      
      // Send email notification
      try {
        // Get user email
        const user = await getUserById(userId);
        if (user && user.email) {
          await sendNotificationEmail(
            user.email,
            `New Ticket: ${ticket.title}`,
            `A new ticket has been created that requires your attention: "${ticket.title}"
            
Priority: ${ticket.priority}
Department: ${ticket.destination_department_id ? await getDepartmentName(ticket.destination_department_id) : 'Unknown'}
            
Description: ${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}`,
            ticketId
          );
          console.log(`Email notification sent to ${user.email} for new ticket`);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Continue even if email fails
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating new ticket notification:', error);
    throw error;
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getNotificationsByUser(userId);
    
    return res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get unread notifications for a user
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getUnreadNotificationsByUser(userId);
    
    return res.json(notifications);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const notification = await markNotificationAsRead(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await markAllNotificationsAsRead(userId);
    
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all notifications for a user
exports.getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, 
      [userId]
    );
    
    res.json(notifications.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, message, ticket_id } = req.body;
    
    if (!user_id || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, message, ticket_id, is_read, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING *`,
      [user_id, message, ticket_id]
    );
    
    const notification = result.rows[0];
    
    res.status(201).json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Make sure the notification belongs to the user
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or access denied' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false
       RETURNING *`,
      [userId]
    );
    
    res.json({ 
      success: true, 
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await db.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or access denied' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  // These are the functions defined with exports.functionName syntax
  getNotificationsForUser: exports.getNotificationsForUser,
  createNotification: exports.createNotification,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead,
  deleteNotification: exports.deleteNotification,
  getUnreadCount: exports.getUnreadCount,
  
  // Include these if they're defined as local functions
  createTicketStatusNotification,
  createNewTicketNotification,
  getUserNotifications,
  getUnreadNotifications
};