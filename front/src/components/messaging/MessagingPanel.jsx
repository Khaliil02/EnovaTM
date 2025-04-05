import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { FiSend, FiMessageSquare, FiX } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import { messageApi } from "../../services/api";
import socket from "../../services/socketService";
import { sendTypingStatus } from "../../services/messageService";
import debounce from "lodash/debounce";

const MessagingPanel = ({ ticketId, recipientId, recipientName, onClose }) => {
  // Initialize messages as an empty array
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  // Fetch conversation history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messageApi.getConversation(
          ticketId,
          recipientId
        );
        // Ensure we always have an array, even if response.data is null/undefined
        setMessages(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load conversation history");
        // Ensure messages is still an array if there's an error
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId && recipientId) {
      fetchMessages();
    }
  }, [ticketId, recipientId]);

  // Socket listener for new messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Only add messages related to this conversation
      if (
        message.ticket_id === Number(ticketId) &&
        ((message.sender_id === Number(recipientId) &&
          message.recipient_id === Number(user.id)) ||
          (message.sender_id === Number(user.id) &&
            message.recipient_id === Number(recipientId)))
      ) {
        setMessages((prev) => [...prev, message]);
        // Stop typing indicator when message received
        setIsTyping(false);
      }
    };

    const handleTyping = (data) => {
      if (
        data.ticketId === Number(ticketId) &&
        data.senderId === Number(recipientId) &&
        data.recipientId === Number(user.id)
      ) {
        setIsTyping(true);
      }
    };

    const handleStoppedTyping = (data) => {
      if (
        data.ticketId === Number(ticketId) &&
        data.senderId === Number(recipientId) &&
        data.recipientId === Number(user.id)
      ) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStoppedTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStoppedTyping);
    };
  }, [ticketId, recipientId, user.id]);

  // Debounced typing notification
  const debouncedTypingStatus = useCallback(
    debounce((isTyping) => {
      sendTypingStatus(ticketId, user.id, recipientId, isTyping);
    }, 300),
    [ticketId, user.id, recipientId]
  );

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value) {
      debouncedTypingStatus(true);
    } else {
      debouncedTypingStatus(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setLoading(true);

      // Create a temporary message object with current date for immediate display
      const tempMessage = {
        id: `temp-${Date.now()}`,
        ticket_id: Number(ticketId),
        sender_id: Number(user.id),
        recipient_id: Number(recipientId),
        content: newMessage,
        created_at: new Date().toISOString(),
        sender_name: user.name,
        recipient_name: recipientName,
        is_read: false,
      };

      // Add the message to the UI immediately
      setMessages((prev) => [...prev, tempMessage]);

      // Clear the input and send typing status
      setNewMessage("");
      sendTypingStatus(ticketId, user.id, recipientId, false);

      // Then send to server
      await messageApi.send(ticketId, recipientId, newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <FiMessageSquare className="mr-2" />
          <h3 className="font-medium">Chat with {recipientName}</h3>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <FiX size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 && (
          <p className="text-center text-gray-500">Loading messages...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded">{error}</div>
        )}

        {!loading && messages.length === 0 && !error && (
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        )}

        {/* Use Array.isArray to check before mapping */}
        {Array.isArray(messages) &&
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 px-4 py-2 rounded-lg ${
                  message.sender_id === user.id
                    ? "bg-primary-100 text-primary-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {message.created_at
                    ? new Date(message.created_at).toLocaleTimeString()
                    : "Just now"}
                </p>
              </div>
            </div>
          ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg">
              <span className="typing-indicator">
                <span className="dot" key="dot-1"></span>
                <span className="dot" key="dot-2"></span>
                <span className="dot" key="dot-3"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t p-2">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-md px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 disabled:opacity-50"
            disabled={loading || !newMessage.trim()}
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessagingPanel;
