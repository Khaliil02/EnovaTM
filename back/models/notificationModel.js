const db = require('../config/db');

// Create a new notification
const createNotification = async (userId, ticketId, message, type) => {
  const query = `
    INSERT INTO notifications (user_id, ticket_id, message, notification_type)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [userId, ticketId, message, type];
  
  try {
    console.log(`Creating notification for user ${userId} about ticket ${ticketId}: ${message}`);
    
    const result = await db.query(query, values);
    
    console.log('Notification created:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get all notifications for a user
const getNotificationsByUser = async (userId) => {
  const query = `
    SELECT n.*, t.title as ticket_title
    FROM notifications n
    JOIN tickets t ON n.ticket_id = t.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Get unread notifications for a user
const getUnreadNotificationsByUser = async (userId) => {
  const query = `
    SELECT n.*, t.title as ticket_title
    FROM notifications n
    JOIN tickets t ON n.ticket_id = t.id
    WHERE n.user_id = $1 AND n.is_read = FALSE
    ORDER BY n.created_at DESC
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

// Mark a notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  
  try {
    const result = await db.query(query, [notificationId, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
  `;
  
  try {
    await db.query(query, [userId]);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
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