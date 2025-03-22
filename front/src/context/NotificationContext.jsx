import { createContext, useState, useEffect, useContext } from 'react';
import { getUnreadNotifications, getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Fetch notifications initially and set up refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up polling for new notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check for new notifications every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Optimize socket connection management
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    // Create singleton socket instance
    if (!window.notificationSocket) {
      console.log('Creating new socket connection');
      window.notificationSocket = io(import.meta.env.VITE_API_URL);
      
      // Set up event listeners once
      window.notificationSocket.on('connect', () => {
        console.log('Socket connected');
      });
      
      window.notificationSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      window.notificationSocket.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    
    // Authenticate with current user ID
    window.notificationSocket.emit('authenticate', user.id);
    
    return () => {
      // Only disconnect on logout, not on component unmount
      if (!isAuthenticated) {
        window.notificationSocket?.disconnect();
        window.notificationSocket = null;
      }
    };
  }, [isAuthenticated, user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotifications();
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};