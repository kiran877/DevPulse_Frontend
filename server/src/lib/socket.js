import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * Called once from index.js.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Authenticate socket using JWT from handshake
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Unauthorized: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.user?.username})`);

    // Client emits this to subscribe to a repo's real-time metrics
    socket.on('join:repo', ({ repoFullName }) => {
      if (typeof repoFullName === 'string' && repoFullName.includes('/')) {
        socket.join(repoFullName);
        console.log(`📡 ${socket.user?.username} joined room: ${repoFullName}`);
        socket.emit('join:ack', { repoFullName, status: 'joined' });
      }
    });

    // Client emits this when navigating away from a repo
    socket.on('leave:repo', ({ repoFullName }) => {
      socket.leave(repoFullName);
      console.log(`👋 ${socket.user?.username} left room: ${repoFullName}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

/**
 * Get the Socket.io instance (after initialization).
 * Used by other modules (e.g. webhook route) to emit events.
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet. Call initSocket() first.');
  }
  return io;
}
