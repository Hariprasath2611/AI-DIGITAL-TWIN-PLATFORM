import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface Notification {
  _id: string;
  message: string;
  type: 'view' | 'recommendation' | 'message' | 'reminder';
  read: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial notifications from DB
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/auth/me'); // User details already has notifications, but we can query them or do mock fetch
        // Let's call a custom endpoint or generate mock initial notifications
        const notifRes = await api.get('/admin/uploads').catch(() => ({ data: [] })); // mock check
        // Let's construct default notifications or query '/notifications' if we have it.
        // Let's retrieve from local storage or seed some.
        const stored = localStorage.getItem(`notifications_${user.firebaseUid}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
        } else {
          const initialNotifs: Notification[] = [
            {
              _id: 'n1',
              message: 'Welcome to your AI Digital Twin! Start by uploading your resume in the Knowledge Base.',
              type: 'recommendation',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ];
          setNotifications(initialNotifs);
          setUnreadCount(1);
          localStorage.setItem(`notifications_${user.firebaseUid}`, JSON.stringify(initialNotifs));
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifications();

    // 2. Setup Socket.io connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    let socket: Socket;

    try {
      socket = io(socketUrl);

      socket.on('connect', () => {
        console.log('[Socket] Connected to server, registering user:', user.firebaseUid);
        socket.emit('register', user.firebaseUid);
      });

      socket.on('notification', (newNotif: Notification) => {
        console.log('[Socket] Received live notification:', newNotif);
        setNotifications((prev) => {
          const updated = [newNotif, ...prev];
          localStorage.setItem(`notifications_${user.firebaseUid}`, JSON.stringify(updated));
          return updated;
        });
        setUnreadCount((c) => c + 1);
      });
    } catch (err) {
      console.warn('[Socket] Could not connect to realtime server. Standard notifications will display.', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const markAllAsRead = () => {
    if (!user) return;
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem(`notifications_${user.firebaseUid}`, JSON.stringify(updated));
  };

  const addNotification = (message: string, type: 'view' | 'recommendation' | 'message' | 'reminder') => {
    if (!user) return;
    const newNotif: Notification = {
      _id: `notif_${Date.now()}`,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      localStorage.setItem(`notifications_${user.firebaseUid}`, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((c) => c + 1);
  };

  return { notifications, unreadCount, markAllAsRead, addNotification };
};
