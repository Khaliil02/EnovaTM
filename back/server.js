require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Add this near your other routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with more explicit configuration
const io = socketIo(server, {
  cors: {
    origin: '*', // More permissive for testing - change for production
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io' // Make sure this matches any path on the client
});

// Store connected users for efficient notification delivery
const connectedUsers = new Map();

// Store io instance for use in other files
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  
  // Handle authentication
  socket.on('authenticate', (userId) => {
    if (!userId) return;
    
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
    socket.join(`user:${userId}`);
    socket.emit('authenticated', { success: true });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Utility function to check if a user is online
app.set('isUserOnline', (userId) => {
  return connectedUsers.has(userId) && connectedUsers.get(userId).size > 0;
});

// Simplified notification sender function
app.set('sendNotification', (userId, notification) => {
  if (userId) {
    io.to(`user:${userId}`).emit('newNotification', notification);
    return true;
  }
  return false;
});

// Add a general connection test endpoint
app.get('/api/socket-test', (req, res) => {
  res.json({ status: 'Socket.io server running' });
});

// Update server start
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

