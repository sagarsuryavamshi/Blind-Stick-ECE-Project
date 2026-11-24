import { io } from 'socket.io-client';

/**
 * Socket.IO Telemetry Client Service
 * Features:
 * - Singleton socket instance (prevents multiple duplicate connections).
 * - Automatic reconnection with exponential backoff.
 * - Subscriptions for:
 *   - sensor:update
 *   - alert:new
 *   - alert:resolved
 *   - device:status
 * - Proper cleanup listeners.
 */

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('📡 [Socket.IO] Connected to SmartGuard live telemetry stream:', this.socket.id);
      this.emitInternal('connection:change', true);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.warn('📡 [Socket.IO] Disconnected from stream:', reason);
      this.emitInternal('connection:change', false);
    });

    this.socket.on('connect_error', (err) => {
      this.connected = false;
      this.emitInternal('connection:change', false);
    });

    // Relay core backend events
    ['sensor:update', 'alert:new', 'alert:resolved', 'device:status', 'connection:ack'].forEach((eventName) => {
      this.socket.on(eventName, (data) => {
        this.emitInternal(eventName, data);
      });
    });

    return this.socket;
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return cleanup unsubscriber function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emitInternal(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for ${event}:`, e);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
