import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
});

// Connect event - authenticate user as soon as connected
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  
  // Authenticate with user ID if available
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.id) {
    socket.emit('authenticate', user.id);
    console.log('Socket authenticated for user:', user.id);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;