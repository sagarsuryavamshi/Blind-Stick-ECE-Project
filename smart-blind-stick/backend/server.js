import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

import { connectDB, getDbStatus, isDbConnected } from './config/database.js';
import { deviceManager } from './services/deviceManager.js';
import { notificationService } from './services/notificationService.js';
import sensorRoutes from './routes/sensorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Security Headers with Helmet
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));

// 3. Request body parsing
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// 4. Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please slow down.',
  },
});
app.use('/api/', limiter);

// 5. Socket.IO Initialization
const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);

// Initialize Device Heartbeat & Notification Services with Socket.IO
deviceManager.init(io);
notificationService.setIo(io);

let activeDashboards = 0;

io.on('connection', (socket) => {
  activeDashboards += 1;
  const currentDevice = deviceManager.getDeviceStatus(process.env.DEVICE_ID || 'BLINDSTICK001');

  socket.emit('connection:ack', {
    message: 'Connected to SmartGuard IoT telemetry & notification stream',
    timestamp: new Date().toISOString(),
    device: currentDevice,
  });

  socket.on('disconnect', () => {
    activeDashboards = Math.max(0, activeDashboards - 1);
  });
});

// 6. Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'SmartGuard PRO – IoT Assistive Monitoring Platform',
    tagline: 'Intelligent Mobility. Safer Independence.',
    version: '2.2.0',
    documentation: '/api/health',
    mode: isDbConnected() ? 'MONGODB_ATLAS' : 'IN_MEMORY_DEV',
  });
});

// 7. Health & Diagnostic Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  const dbConnected = isDbConnected();
  const device = deviceManager.getDeviceStatus(process.env.DEVICE_ID || 'BLINDSTICK001');

  res.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: dbConnected,
      mode: dbConnected ? 'MONGODB_ATLAS' : 'DISCONNECTED_DEV_MODE',
      note: dbConnected
        ? 'Connected to MongoDB Atlas cluster'
        : 'Running in development session mode (set MONGODB_URI to persist to Atlas)',
    },
    emergencyGateway: {
      type: 'PHYSICAL_HARDWARE_GSM',
      module: 'SIM900A_GSM_MODULE',
      status: 'HARDWARE_INTEGRATION_PENDING',
    },
    device: {
      deviceId: device.deviceId,
      status: device.status,
      connected: device.status !== 'OFFLINE',
      lastSeen: device.lastSeen,
      batteryLevel: device.batteryLevel,
    },
    activeClients: activeDashboards,
  });
});

// 8. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);

// 9. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.url}`,
  });
});

// 10. Centralized Error Handler
app.use(errorHandler);

// 11. Graceful Shutdown & Server Startup
async function startServer() {
  await connectDB();

  server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================================');
    console.log(`🚀 SmartGuard PRO Backend running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Autonomous Hardware Emergency Architecture (SIM900A Pending)`);
    console.log(`🔒 Caregiver Auth & Device Token Authentication enabled`);
    console.log(`🌐 Allowed Origin: ${FRONTEND_URL}`);
    console.log(`📡 Socket.IO status stream ready`);
    console.log('========================================================\n');
  });
}

function handleGracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Gracefully terminating SmartGuard server...`);
  deviceManager.shutdown();
  server.close(() => {
    console.log('🏁 SmartGuard HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

export { app, server, io };
