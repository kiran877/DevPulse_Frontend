import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
