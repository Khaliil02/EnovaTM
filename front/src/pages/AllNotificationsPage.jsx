import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiInbox, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { notificationApi } from '../services/api';

const AllNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.getAll();
        setNotifications(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn btn-sm btn-secondary flex items-center"
          >
            <FiCheck className="mr-2" /> Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <FiInbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`relative ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                <Link
                  to={notification.ticket_id ? `/tickets/${notification.ticket_id}` : '#'}
                  className="block hover:bg-gray-50"
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between">
                      <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''} text-gray-900`}>
                        {notification.message}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                    {notification.ticket_title && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Ticket: {notification.ticket_title}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                {!notification.is_read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllNotificationsPage;