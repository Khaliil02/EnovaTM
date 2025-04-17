import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { messageApi } from "../../services/api";
import { FiMessageSquare, FiChevronRight } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const RecentMessagesWidget = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        const response = await messageApi.getRecentMessages(5); // Get last 5 messages
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching recent messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();

    // Set up refresh interval
    const intervalId = setInterval(fetchRecentMessages, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Format relative time (e.g. "2 hours ago")
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch (e) {
      return timeString;
    }
  };

  // Handle click to navigate to ticket with message panel open
  const handleMessageClick = (ticketId, senderId) => {
    navigate(`/tickets/${ticketId}`, {
      state: { openMessaging: true, messageUserId: senderId },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Recent Messages</h3>
        <Link
          to="/messages"
          className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
        >
          View all messages
          <FiChevronRight className="ml-1" />
        </Link>
      </div>

      {loading ? (
        <div className="py-4 text-center text-gray-500">
          <div className="animate-pulse flex flex-col space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <FiMessageSquare className="mx-auto h-8 w-8 mb-2" />
          <p>No recent messages</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() =>
                handleMessageClick(
                  msg.ticketId,
                  msg.sender_id || msg.senderName
                )
              }
              className="block p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-medium truncate">
                      {msg.senderName}
                    </span>
                    {!msg.is_read && (
                      <span className="ml-2 h-2 w-2 bg-primary-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {msg.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Ticket #{msg.ticketId}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 self-center ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentMessagesWidget;
