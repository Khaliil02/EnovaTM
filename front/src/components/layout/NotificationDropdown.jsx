import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiBell, FiCheck, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    socketConnected,
    markAsRead, 
    markAllAsRead, 
    fetchNotifications 
  } = useNotifications();

  useEffect(() => {
    // Refresh notifications every 60 seconds
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center">
        {/* Socket connection indicator */}
        <div className="mr-2" title={socketConnected ? "Connected" : "Disconnected"}>
          {socketConnected ? (
            <FiWifi className="text-green-400 h-3 w-3" />
          ) : (
            <FiWifiOff className="text-gray-400 h-3 w-3" />
          )}
        </div>
        
        <Menu.Button
          className="relative p-2 rounded-full text-white hover:bg-primary-700 focus:outline-none transition-colors notification-bell-container"
          onClick={() => fetchNotifications()}
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5 notification-bell" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <h3 className="text-sm font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
              >
                <FiCheck className="mr-1" /> Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <Link
                      to={`/tickets/${notification.ticket_id}`}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`${
                        active ? 'bg-primary-50' : ''
                      } ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-primary-500' : ''
                      } block px-4 py-3 border-b text-sm notification-item`}
                    >
                      <div className="flex justify-between">
                        <p className={`${!notification.is_read ? 'font-medium' : ''} text-gray-900`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {notification.ticket_title || 'View ticket details'}
                      </p>
                    </Link>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="py-2 px-4 text-center border-t border-gray-200">
              <Link to="/all-notifications" className="text-sm text-primary-600 hover:text-primary-800">
                View all notifications
              </Link>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;