import api from './api';
import socket from './socketService';

export const sendMessage = async (ticketId, recipientId, content) => {
  try {
    const response = await api.post('/messages', {
      ticketId,
      recipientId,
      content
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getConversation = async (ticketId, userId) => {
  try {
    const response = await api.get(`/messages/ticket/${ticketId}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const sendTypingStatus = (ticketId, senderId, recipientId, isTyping) => {
  if (isTyping) {
    socket.emit('typing', { ticketId, senderId, recipientId });
  } else {
    socket.emit('stoppedTyping', { ticketId, senderId, recipientId });
  }
};