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

// Update this function too
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

// Modify the createNewTicketNotification function to accept io directly
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

module.exports = {
  createTicketStatusNotification,
  createNewTicketNotification,
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead
};