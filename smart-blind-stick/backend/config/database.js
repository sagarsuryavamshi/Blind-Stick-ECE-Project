import mongoose from 'mongoose';

/**
 * MongoDB connection manager for SmartGuard PRO.
 * Connects to MongoDB Atlas using process.env.MONGODB_URI.
 * Features:
 * - Robust event logging (connecting, connected, error, disconnected).
 * - Automatic reconnection handling.
 * - Graceful fallback to in-memory session mode when MONGODB_URI is absent or unreachable.
 * - Accurate connection state reporting (never falsely claims connected).
 */

let isConnected = false;

// Register global Mongoose connection event listeners
mongoose.connection.on('connecting', () => {
  console.log('🔄 [MongoDB] Connecting to MongoDB Atlas cluster...');
});

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`✅ [MongoDB] Connection established successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`❌ [MongoDB] Connection error encountered: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  [MongoDB] Disconnected from MongoDB Atlas.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🔄 [MongoDB] Reconnected to MongoDB Atlas cluster.');
});

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn('\n⚠️  [MongoDB] MONGODB_URI is not provided in environment variables.');
    console.warn('ℹ️  [MongoDB] Operating in disconnected development mode (In-Memory session active).\n');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    isConnected = true;
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\n❌ [MongoDB] Initial connection failure: ${error.message}`);
    console.warn('ℹ️  [MongoDB] Continuing in disconnected development mode (In-Memory fallback).\n');
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      return 'DISCONNECTED';
    case 1:
      return 'CONNECTED';
    case 2:
      return 'CONNECTING';
    case 3:
      return 'DISCONNECTING';
    default:
      return 'DISCONNECTED';
  }
}
