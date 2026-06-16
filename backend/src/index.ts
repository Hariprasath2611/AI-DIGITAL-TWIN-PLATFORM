import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Configurations
dotenv.config();
import { connectDB } from './config/db';
import apiRouter from './routes';
import { initNotificationSocket } from './sockets/notificationSocket';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // in production, restrict to your client domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false, // allow loading scripts/styles from CDN in dev
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

// Mount main API routes
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Realtime Sockets Initializer
initNotificationSocket(io);

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] AI Digital Twin server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('[Server] Critical start failure:', err);
});
