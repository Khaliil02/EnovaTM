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
const attachmentRoutes = require('./routes/attachmentRoutes'); // Add this line here
const notificationRoutes = require('./routes/notificationRoutes'); // Add this with your other route imports

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
app.use('/api/attachments', attachmentRoutes); // Add this line here
app.use('/api/notifications', notificationRoutes); // Add this with your other app.use statements

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store io instance for use in other files
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Handle authentication and join user-specific room
  socket.on('authenticate', (userId) => {
    console.log(`User ${userId} authenticated with socket`);
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Update server start
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// In your notificationController, get the io instance this way:
// Example: const io = req.app.get('io');

