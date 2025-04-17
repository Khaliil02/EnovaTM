import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { messageApi } from "../services/api";
import { FiMessageSquare, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import MessagingPanel from "../components/messaging/MessagingPanel";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

const MessagesInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch all conversations for the current user
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messageApi.getUserConversations();

        // Ensure we have valid data and sort by most recent
        if (Array.isArray(response.data)) {
          // Sort conversations by last message time (most recent first)
          const sortedConversations = response.data.sort((a, b) => {
            const dateA = new Date(a.last_message_time || 0);
            const dateB = new Date(b.last_message_time || 0);
            return dateB - dateA;
          });

          setConversations(sortedConversations);
        } else {
          console.error("Invalid conversation data format:", response.data);
          setConversations([]);
          setError("Failed to load conversations: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load conversations. Please try again later.");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch (e) {
      return timeString;
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation({
      ticketId: conversation.ticket_id,
      userId: conversation.user_id,
      userName: conversation.user_name,
    });
  };

  // Handle message sent - refresh conversations list
  const handleMessageSent = async () => {
    try {
      const response = await messageApi.getUserConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row h-[70vh] bg-white rounded-lg shadow-md">
        {/* Conversations list */}
        <div className="w-full md:w-1/3 border-r overflow-y-auto">
          {loading ? (
            <LoadingSpinner text="Loading conversations..." />
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiMessageSquare className="mx-auto h-12 w-12 mb-4" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <div
                key={`${convo.ticket_id}-${convo.user_id}`}
                onClick={() => handleSelectConversation(convo)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation &&
                  selectedConversation.ticketId === convo.ticket_id &&
                  selectedConversation.userId === convo.user_id
                    ? "bg-primary-50 border-l-4 border-primary-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{convo.user_name}</p>
                    <p className="text-sm text-gray-600">
                      Ticket #{convo.ticket_id}: {convo.ticket_subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {convo.last_message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(convo.last_message_time)}
                      </span>
                      {parseInt(convo.unread_count) > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <FiChevronRight className="ml-2 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message panel */}
        <div className="w-full md:w-2/3 flex flex-col">
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              <div className="p-3 bg-gray-50 border-b">
                <p className="font-medium">{selectedConversation.userName}</p>
                <p className="text-xs text-gray-500">
                  Ticket #{selectedConversation.ticketId} -{" "}
                  <Link
                    to={`/tickets/${selectedConversation.ticketId}`}
                    className="text-primary-600 hover:underline"
                  >
                    View Ticket
                  </Link>
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <MessagingPanel
                  ticketId={selectedConversation.ticketId}
                  recipientId={selectedConversation.userId}
                  recipientName={selectedConversation.userName}
                  onClose={() => setSelectedConversation(null)}
                  onMessageSent={handleMessageSent}
                  fullHeight
                  embedded
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center p-8">
                <FiMessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg mb-2">Select a conversation</p>
                <p className="text-sm">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesInboxPage;
