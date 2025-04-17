import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Track connection state
let isConnected = false;
let connectionListeners = [];

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Connect event - authenticate user as soon as connected
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  isConnected = true;
  notifyListeners();
  
  // Authenticate with user ID if available
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.id) {
    socket.emit('authenticate', user.id);
    console.log('Socket authenticated for user:', user.id);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
  isConnected = false;
  notifyListeners();
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  isConnected = false;
  notifyListeners();
  
  // Attempt to reconnect after error
  setTimeout(() => {
    console.log('Attempting to reconnect socket...');
    socket.connect();
  }, 5000);
});

// Function to subscribe to connection state changes
function subscribeToConnectionState(callback) {
  connectionListeners.push(callback);
  // Immediately call with current state
  callback(isConnected);
  
  // Return unsubscribe function
  return () => {
    connectionListeners = connectionListeners.filter(cb => cb !== callback);
  };
}

// Function to notify all listeners of connection state changes
function notifyListeners() {
  connectionListeners.forEach(callback => callback(isConnected));
}

// Function to check if socket is currently connected
function isSocketConnected() {
  return isConnected;
}

// Add reconnect method for manual reconnection
function reconnect() {
  if (!isConnected) {
    socket.connect();
  }
}

export default socket;
export { isSocketConnected, subscribeToConnectionState, reconnect };