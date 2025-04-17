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

// Create notifications for ticket status changes
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
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating status notification:', error);
    throw error;
  }
};

// Create notifications for new tickets
const createNewTicketNotification = async (ticketId, createdBy, io = null) => {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const stakeholderIds = await getTicketStakeholders(ticketId);
    
    // Don't notify the creator
    const recipientIds = stakeholderIds.filter(id => id != createdBy);
    
    if (recipientIds.length === 0) {
      return [];
    }
    
    const message = `New ticket created: "${ticket.title}"`;
    
    // Create notifications for each recipient
    const notifications = [];
    for (const userId of recipientIds) {
      const notification = await createNotification(
        userId, 
        ticketId,
        message,
        'new_ticket'
      );
      notifications.push(notification);
      
      // Emit to socket if available
      if (io) {
        io.to(`user:${userId}`).emit('newNotification', notification);
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
    
    return res.json({ message: 'All notifications marked as read', success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Use a direct query since we don't have a model function for deletion
    const db = require('../config/db');
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
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getUnreadNotificationsByUser(userId);
    
    res.json({ count: notifications.length });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createTicketStatusNotification,
  createNewTicketNotification
};