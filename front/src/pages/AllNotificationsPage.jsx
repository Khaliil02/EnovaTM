import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import {
  FiTrash2,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiInfo,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const AllNotificationsPage = () => {
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case "new_ticket":
        return <FiInfo className="text-blue-500" />;
      case "new_message":
        return <FiExternalLink className="text-green-500" />;
      case "status_change":
        return <FiCheckCircle className="text-orange-500" />;
      default:
        return <FiInfo className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            All Notifications
          </h1>
          <button
            onClick={markAllAsRead}
            className="flex items-center text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded hover:bg-primary-100"
          >
            <FiCheckCircle className="mr-1" /> Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FiInfo size={40} className="mb-4" />
            <p>No notifications found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationTypeIcon(notification.notification_type)}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="text-base text-gray-800">
                      {notification.message}
                    </div>

                    {notification.ticket_id && (
                      <Link
                        to={`/tickets/${notification.ticket_id}`}
                        className="text-sm text-primary-600 hover:text-primary-800 hover:underline mt-1 inline-block"
                      >
                        View ticket{" "}
                        <FiExternalLink className="inline ml-1" size={14} />
                      </Link>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Mark as read"
                      >
                        <FiCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete notification"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllNotificationsPage;
