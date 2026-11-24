import { z } from 'zod';
import { Sensor } from '../models/Sensor.js';
import { Alert } from '../models/Alert.js';
import { isDbConnected } from '../config/database.js';
import { emergencyService } from '../services/emergencyService.js';
import { deviceManager } from '../services/deviceManager.js';
import { deriveComponentStatuses } from '../services/hardwareInventory.js';

// In-Memory store for active session when DB is disconnected
let latestReading = null;
let readingHistory = [];

/**
 * Zod Schema for Sensor Ingestion Validation
 * Future ESP32 Compatibility:
 * - Supports batteryLevel: null (for hardware configurations without battery divider resistor)
 * - Accepts floating or integer distances
 * - Rejects malformed requests
 */
export const sensorDataSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  frontDistance: z.number().min(0).max(500, 'frontDistance must be between 0 and 500 cm'),
  leftDistance: z.number().min(0).max(500, 'leftDistance must be between 0 and 500 cm'),
  rightDistance: z.number().min(0).max(500, 'rightDistance must be between 0 and 500 cm'),
  waterDetected: z.boolean(),
  fallDetected: z.boolean(),
  batteryLevel: z.number().min(0).max(100).nullable().optional().default(null),
  movementStatus: z.string().optional().default('Active Walking'),
  accel: z
    .object({
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      z: z.number().optional().default(9.81),
    })
    .optional(),
  gyro: z
    .object({
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      z: z.number().optional().default(0),
    })
    .optional(),
});

/**
 * POST /api/sensors/data
 * Ingestion point for ESP32 and testing clients.
 */
export async function postSensorData(req, res, next) {
  try {
    const validation = sensorDataSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.format(),
      });
    }

    const data = validation.data;
    const now = new Date();
    const sensorDoc = {
      ...data,
      timestamp: now,
    };

    // 1. Record actual hardware heartbeat (marks device ONLINE)
    deviceManager.recordHeartbeat(data.deviceId, data);

    // 2. Persist to MongoDB if connected, else in-memory
    if (isDbConnected()) {
      await Sensor.create(sensorDoc);
    }

    latestReading = sensorDoc;
    readingHistory.unshift(sensorDoc);
    if (readingHistory.length > 100) readingHistory.pop();

    // 3. Evaluate safety hazards
    const hazard = emergencyService.evaluateSensorTelemetry(data);
    let alertCreated = null;

    if (hazard) {
      const alertDoc = {
        deviceId: data.deviceId,
        alertType: hazard.alertType,
        category:
          hazard.alertType === 'FALL_DETECTED'
            ? 'Fall Events'
            : hazard.alertType === 'WATER_HAZARD'
            ? 'Water Detections'
            : 'Obstacle Detections',
        severity: hazard.severity,
        title: hazard.alertType.replace('_', ' '),
        description: hazard.description,
        status: 'ACTIVE',
        timestamp: now,
        notificationStatus: 'NOT_REQUIRED',
      };

      const notifResult = await emergencyService.processEmergencyAlert({
        alertType: hazard.alertType,
        deviceId: data.deviceId,
        description: hazard.description,
        severity: hazard.severity,
      });

      if (notifResult.dispatched) {
        alertDoc.notificationStatus = 'SIMULATED';
        alertDoc.recipient = notifResult.notification?.recipientName;
      }

      if (isDbConnected()) {
        alertCreated = await Alert.create(alertDoc);
      } else {
        alertCreated = {
          _id: 'alt_' + Math.random().toString(36).substring(2, 9),
          ...alertDoc,
        };
      }

      // Broadcast alert through Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('alert:new', alertCreated);
      }
    }

    // 4. Broadcast live sensor telemetry to connected dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('sensor:update', sensorDoc);
    }

    return res.status(201).json({
      success: true,
      message: 'Sensor telemetry accepted and broadcast',
      data: sensorDoc,
      hazardDetected: hazard ? hazard.alertType : null,
      alert: alertCreated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sensors/latest
 */
export async function getLatestSensorData(req, res, next) {
  try {
    if (isDbConnected()) {
      const reading = await Sensor.findOne().sort({ timestamp: -1 });
      if (reading) {
        return res.json({ success: true, data: reading });
      }
    }

    if (latestReading) {
      return res.json({ success: true, data: latestReading });
    }

    return res.json({
      success: true,
      message: 'No sensor telemetry recorded yet. ESP32 waiting for initial ping.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sensors/history
 */
export async function getSensorHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    if (isDbConnected()) {
      const history = await Sensor.find().sort({ timestamp: -1 }).limit(limit);
      return res.json({ success: true, count: history.length, data: history });
    }

    return res.json({
      success: true,
      count: Math.min(readingHistory.length, limit),
      data: readingHistory.slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sensors/hardware-components
 * Returns the official hardware inventory and dynamic component monitoring health
 */
export async function getHardwareComponents(req, res, next) {
  try {
    const deviceId = req.query.deviceId || process.env.DEVICE_ID || 'BLINDSTICK001';
    const deviceStatus = deviceManager.getDeviceStatus(deviceId);

    let latest = null;
    if (isDbConnected()) {
      latest = await Sensor.findOne({ deviceId }).sort({ timestamp: -1 });
    }
    if (!latest) {
      latest = latestReading;
    }

    const { summary, components } = deriveComponentStatuses(deviceStatus, latest);

    return res.json({
      success: true,
      deviceId,
      deviceStatus: deviceStatus.status,
      lastHeartbeat: deviceStatus.lastSeen,
      summary,
      components,
    });
  } catch (error) {
    next(error);
  }
}
