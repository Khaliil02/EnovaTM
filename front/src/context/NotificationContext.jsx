import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { notificationApi } from '../services/api';
import { playNotificationSound } from '../utils/notificationSound';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await notificationApi.getAll();
      if (response.data) {
        setNotifications(response.data);
        
        // Count unread
        const unreadNotifications = response.data.filter(n => !n.is_read);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Update unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || unreadCount === 0) return;
    
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [isAuthenticated, unreadCount]);

  // Socket.io connection management
  useEffect(() => {
    let socket = null;
    
    const setupSocket = () => {
      if (!isAuthenticated || !user?.id) return null;
      
      // Create new socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'] // Try forcing WebSocket first
      });
      
      console.log('Attempting to connect to Socket.io at:', import.meta.env.VITE_API_URL || 'http://localhost:5000');

      newSocket.on('connect', () => {
        setSocketConnected(true);
        
        // Authenticate with user ID
        newSocket.emit('authenticate', user.id);
      });
      
      newSocket.on('disconnect', () => {
        setSocketConnected(false);
      });
      
      newSocket.on('authenticated', () => {
        // Fetch latest notifications after authentication
        fetchNotifications();
      });
      
      newSocket.on('reconnect', () => {
        // Re-authenticate after reconnection
        newSocket.emit('authenticate', user.id);
      });
      
      newSocket.on('newNotification', (notification) => {
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound
        playNotificationSound();
        
        // Show browser notification if supported and page is not visible
        if ('Notification' in window && document.visibilityState !== 'visible') {
          if (Notification.permission === 'granted') {
            new Notification('New Notification', { 
              body: notification.message,
              icon: '/logo.png' // Add your logo path here
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        setSocketConnected(false);
      });

      newSocket.on('connect_timeout', () => {
        console.error('Socket.io connection timeout');
        setSocketConnected(false);
      });
      
      return newSocket;
    };
    
    socket = setupSocket();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('authenticated');
        socket.off('newNotification');
        socket.off('reconnect');
        
        if (user?.id) {
          socket.emit('logout', user.id);
        }
        
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Periodic refresh for backup in case of socket issues
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        socketConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);