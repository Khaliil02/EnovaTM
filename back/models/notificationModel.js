const db = require('../config/db');

// Create a new notification
const createNotification = async (userId, ticketId, message, type = 'general', metadata = null) => {
  try {
    // Convert metadata to JSON string if provided
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, ticket_id, message, notification_type, metadata, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [userId, ticketId, message, type, metadataJson]
    );
    
    // Add ticket title if there's a ticket ID
    let notification = result.rows[0];
    
    // Parse metadata back to object if it exists
    if (notification.metadata) {
      try {
        notification.metadata = JSON.parse(notification.metadata);
      } catch (err) {
        console.error('Error parsing notification metadata:', err);
      }
    }
    
    if (ticketId) {
      const ticketResult = await db.query(
        'SELECT title FROM tickets WHERE id = $1',
        [ticketId]
      );
      
      if (ticketResult.rows.length > 0) {
        notification.ticket_title = ticketResult.rows[0].title;
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
};

// Get all notifications for a user
const getNotificationsByUser = async (userId) => {
  try {
    const result = await db.query(
      `SELECT n.*, t.title as ticket_title
       FROM notifications n
       LEFT JOIN tickets t ON n.ticket_id = t.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );
    
    // Parse metadata for each notification
    const notifications = result.rows.map(notification => {
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (err) {
          console.error('Error parsing notification metadata:', err);
          notification.metadata = null;
        }
      }
      return notification;
    });
    
    return notifications;
  } catch (error) {
    console.error('Error in getNotificationsByUser:', error);
    throw error;
  }
};

// Get unread notifications for a user
const getUnreadNotificationsByUser = async (userId) => {
  try {
    const result = await db.query(
      `SELECT n.*, t.title as ticket_title
       FROM notifications n
       LEFT JOIN tickets t ON n.ticket_id = t.id
       WHERE n.user_id = $1 AND n.is_read = false
       ORDER BY n.created_at DESC`,
      [userId]
    );
    
    // Parse metadata for each notification
    const notifications = result.rows.map(notification => {
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (err) {
          console.error('Error parsing notification metadata:', err);
          notification.metadata = null;
        }
      }
      return notification;
    });
    
    return notifications;
  } catch (error) {
    console.error('Error in getUnreadNotificationsByUser:', error);
    throw error;
  }
};

// Mark a notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    
    let notification = result.rows[0] || null;
    
    // Parse metadata if exists
    if (notification && notification.metadata) {
      try {
        notification.metadata = JSON.parse(notification.metadata);
      } catch (err) {
        console.error('Error parsing notification metadata:', err);
        notification.metadata = null;
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true, updated_at = NOW()
       WHERE user_id = $1 AND is_read = false
       RETURNING *`,
      [userId]
    );
    
    // Parse metadata for each notification
    const notifications = result.rows.map(notification => {
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (err) {
          console.error('Error parsing notification metadata:', err);
          notification.metadata = null;
        }
      }
      return notification;
    });
    
    return notifications;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
};