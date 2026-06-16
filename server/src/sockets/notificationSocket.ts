import { Server, Socket } from 'socket.io';
import NotificationModel from '../models/Notification';

// Map of userId to active socket instances
const userSockets = new Map<string, Socket>();
let ioInstance: Server | null = null;

export const initNotificationSocket = (io: Server): void => {
  ioInstance = io;
  console.log('[Socket.io] Realtime notification socket handlers registering...');

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Register user ID associated with this socket
    socket.on('register', (userId: string) => {
      if (userId) {
        userSockets.set(userId, socket);
        console.log(`[Socket.io] Registered socket for userId: ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean up map
      for (const [userId, storedSocket] of userSockets.entries()) {
        if (storedSocket.id === socket.id) {
          userSockets.delete(userId);
          console.log(`[Socket.io] Deregistered socket for userId: ${userId}`);
          break;
        }
      }
    });
  });
};

// Helper to send notification in real time and save to database
export const sendNotification = async (
  userId: string,
  message: string,
  type: 'view' | 'recommendation' | 'message' | 'reminder'
): Promise<void> => {
  try {
    // 1. Save to MongoDB
    const notification = await NotificationModel.create({
      userId,
      message,
      type,
      read: false,
    });

    // 2. Send in Realtime if user is online
    const socket = userSockets.get(userId);
    if (socket && ioInstance) {
      socket.emit('notification', notification);
      console.log(`[Socket.io] Sent real-time notification to user ${userId}`);
    } else {
      console.log(`[Socket.io] User ${userId} is offline. Notification saved to database.`);
    }
  } catch (error) {
    console.error('[Socket.io] Error sending notification:', error);
  }
};
