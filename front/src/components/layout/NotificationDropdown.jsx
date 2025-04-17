import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiBell,
  FiCheck,
  FiWifi,
  FiWifiOff,
  FiMessageSquare,
  FiRefreshCw,
} from "react-icons/fi";
import { useNotifications } from "../../context/NotificationContext";

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    socketConnected,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    handleReconnect,
  } = useNotifications();

  const navigate = useNavigate();

  useEffect(() => {
    // Refresh notifications every 60 seconds
    const intervalId = setInterval(() => {
      if (socketConnected) {
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications, socketConnected]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // If it's a message notification and has metadata with a message_id
    if (
      notification.notification_type === "new_message" &&
      notification.metadata &&
      notification.metadata.message_id
    ) {
      // Option to either go to the messages page or the ticket detail page
      if (notification.sender_id) {
        // Navigate to the messages page with the conversation selected
        navigate(`/messages`, {
          state: {
            ticketId: notification.ticket_id,
            userId: notification.sender_id,
            messageId: notification.metadata.message_id,
          },
        });
      } else {
        // Navigate to the ticket page and open the messaging panel (fallback)
        navigate(`/tickets/${notification.ticket_id}`, {
          state: {
            openMessaging: true,
            messageId: notification.metadata.message_id,
          },
        });
      }
    } else {
      // For other notification types, just navigate to the ticket
      navigate(`/tickets/${notification.ticket_id}`);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  // Determine notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_message":
        return <FiMessageSquare className="mr-2 text-blue-500" />;
      default:
        return null;
    }
  };

  // Handle manual reconnection attempt
  const attemptReconnect = (e) => {
    e.stopPropagation(); // Prevent opening dropdown
    handleReconnect();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center">
        {/* Socket connection indicator with reconnect button */}
        {socketConnected ? (
          <div
            className="mr-2 flex items-center"
            title="Connected to notifications"
          >
            <FiWifi className="text-green-400 h-3 w-3" />
          </div>
        ) : (
          <button
            onClick={attemptReconnect}
            className="mr-2 flex items-center group relative"
            title="Disconnected - Click to reconnect"
          >
            <FiWifiOff className="text-red-400 h-3 w-3 group-hover:hidden" />
            <FiRefreshCw className="text-green-400 h-3 w-3 hidden group-hover:block animate-spin" />
          </button>
        )}

        <Menu.Button
          className="relative p-2 rounded-full text-white hover:bg-primary-700 focus:outline-none transition-colors notification-bell-container"
          onClick={(e) => {
            // Only fetch if connected
            if (socketConnected) {
              fetchNotifications();
            }
          }}
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5 notification-bell" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full notification-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
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
            <div className="flex items-center">
              {!socketConnected && (
                <button
                  onClick={handleReconnect}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center mr-2"
                  title="Reconnect to notification service"
                >
                  <FiRefreshCw className="mr-1" /> Reconnect
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FiCheck className="mr-1" /> Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {!socketConnected && (
              <div className="px-4 py-2 text-xs text-red-500 bg-red-50 border-b">
                <span className="flex items-center">
                  <FiWifiOff className="mr-1" />
                  Notification service disconnected. Some features may be
                  unavailable.
                </span>
              </div>
            )}

            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className={`${active ? "bg-primary-50" : ""} ${
                        !notification.is_read
                          ? "bg-blue-50 border-l-4 border-primary-500"
                          : ""
                      } block px-4 py-3 border-b text-sm notification-item cursor-pointer`}
                    >
                      <div className="flex justify-between">
                        <p
                          className={`${
                            !notification.is_read ? "font-medium" : ""
                          } text-gray-900 flex items-center`}
                        >
                          {getNotificationIcon(notification.notification_type)}
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {notification.notification_type === "new_message"
                          ? "Click to view conversation"
                          : notification.ticket_title || "View ticket details"}
                      </p>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="py-2 px-4 text-center border-t border-gray-200">
              <Link
                to="/all-notifications"
                className="text-sm text-primary-600 hover:text-primary-800"
              >
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
