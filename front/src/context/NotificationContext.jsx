import React, { createContext, useState, useEffect, useContext } from "react";
import { notificationApi } from "../services/api";
import socket, {
  subscribeToConnectionState,
  reconnect,
} from "../services/socketService";
import { playNotificationSound } from "../utils/notificationSound";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Track socket connection status
  useEffect(() => {
    // Subscribe to socket connection state changes
    const unsubscribe = subscribeToConnectionState((connected) => {
      setSocketConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  // Load user notification preferences
  useEffect(() => {
    if (user && user.preferences) {
      setNotificationsEnabled(user.preferences.notifications_enabled !== false);
    }
  }, [user]);

  // Fetch notifications on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Set up socket listeners for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !socket) return;

    const handleNewNotification = (notification) => {
      if (notificationsEnabled) {
        // Play sound for new notifications
        playNotificationSound();

        // Add notification to state
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [isAuthenticated, notificationsEnabled]);

  // Function to reconnect socket manually
  const handleReconnect = () => {
    reconnect();
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getAll();
      if (response && response.data) {
        setNotifications(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response && response.data && response.data.count !== undefined) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.delete(notificationId);

      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      const wasUnread = deletedNotification && !deletedNotification.is_read;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Toggle notifications
  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
  };

  // Context value with state and functions
  const value = {
    notifications,
    unreadCount,
    notificationsEnabled,
    socketConnected,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleNotifications,
    handleReconnect,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
