"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.initNotificationSocket = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
// Map of userId to active socket instances
const userSockets = new Map();
let ioInstance = null;
const initNotificationSocket = (io) => {
    ioInstance = io;
    console.log('[Socket.io] Realtime notification socket handlers registering...');
    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);
        // Register user ID associated with this socket
        socket.on('register', (userId) => {
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
exports.initNotificationSocket = initNotificationSocket;
// Helper to send notification in real time and save to database
const sendNotification = async (userId, message, type) => {
    try {
        // 1. Save to MongoDB
        const notification = await Notification_1.default.create({
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
        }
        else {
            console.log(`[Socket.io] User ${userId} is offline. Notification saved to database.`);
        }
    }
    catch (error) {
        console.error('[Socket.io] Error sending notification:', error);
    }
};
exports.sendNotification = sendNotification;
