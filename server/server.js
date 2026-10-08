const dns = require('dns');
dns.setServers(['8.8.8.8']);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const setupWhiteboardSocket = require('./socket/whiteboardSocket');

dotenv.config();

// Global process error handlers for bulletproof server uptime
process.on('uncaughtException', (err) => {
  console.warn('[Server Warning] Uncaught exception caught:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Server Warning] Unhandled promise rejection caught:', reason?.message || reason);
});

const app = express();
const server = http.createServer(app);

// Configure CORS origins (supports env variable CLIENT_URL and dynamic frontend origins)
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Collaborative Whiteboard Server is healthy and running!',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Server configuration with CORS support
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

// Initialize Socket.IO Handlers
setupWhiteboardSocket(io);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Whiteboard Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint ready at ws://localhost:${PORT}`);
    console.log(`==================================================`);
  });
});
