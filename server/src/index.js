import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/db.js';
import { initSocket } from './lib/socket.js';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import metricsRoutes from './routes/metrics.js';

const app = express();
const httpServer = createServer(app); // wrap Express in a raw HTTP server for Socket.io

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api', metricsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  // Initialize Socket.io on the HTTP server
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Only start the server if this file is run directly
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default app;
