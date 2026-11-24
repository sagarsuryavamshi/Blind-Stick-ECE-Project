import { z } from 'zod';
import { Alert } from '../models/Alert.js';
import { isDbConnected } from '../config/database.js';
import { emergencyService } from '../services/emergencyService.js';

// In-Memory store when DB is disconnected
let inMemoryAlerts = [
  {
    _id: 'alt_demo1',
    deviceId: 'BLINDSTICK001',
    alertType: 'FALL_DETECTED',
    severity: 'DANGER',
    description: 'Initial demonstration fall detection event.',
    status: 'ACTIVE',
    timestamp: new Date().toISOString(),
    notificationStatus: 'SIMULATED',
  },
];

const createAlertSchema = z.object({
  deviceId: z.string().optional().default('BLINDSTICK001'),
  alertType: z.enum(['FALL_DETECTED', 'WATER_HAZARD', 'MANUAL_SOS', 'OBSTACLE_PROXIMITY', 'CRITICAL_EMERGENCY']),
  severity: z.enum(['DANGER', 'WARNING', 'INFO']).optional().default('WARNING'),
  description: z.string().min(1, 'Description is required'),
});

/**
 * GET /api/alerts
 */
export async function getAlerts(req, res, next) {
  try {
    const { status, severity, alertType } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (alertType) query.alertType = alertType;

      const alerts = await Alert.find(query).sort({ timestamp: -1 });
      return res.json({ success: true, count: alerts.length, data: alerts });
    }

    let filtered = [...inMemoryAlerts];
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (severity) filtered = filtered.filter((a) => a.severity === severity);
    if (alertType) filtered = filtered.filter((a) => a.alertType === alertType);

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/alerts
 * Trigger manual SOS or emergency alert.
 */
export async function createAlert(req, res, next) {
  try {
    const validation = createAlertSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.format(),
      });
    }

    const { deviceId, alertType, severity, description } = validation.data;
    const now = new Date();

    // Process notification through emergency service
    const notifResult = await emergencyService.processEmergencyAlert({
      alertType,
      deviceId,
      description,
      severity,
    });

    const alertDoc = {
      deviceId,
      alertType,
      severity,
      description,
      status: 'ACTIVE',
      timestamp: now,
      notificationStatus: notifResult.dispatched ? 'SIMULATED' : 'NOT_REQUIRED',
    };

    let savedAlert = null;
    if (isDbConnected()) {
      savedAlert = await Alert.create(alertDoc);
    } else {
      savedAlert = {
        _id: 'alt_' + Math.random().toString(36).substring(2, 9),
        ...alertDoc,
      };
      inMemoryAlerts.unshift(savedAlert);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('alert:new', savedAlert);
    }

    return res.status(201).json({
      success: true,
      message: 'Alert registered successfully',
      data: savedAlert,
      notificationDispatched: notifResult.dispatched,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/alerts/:id/resolve
 */
export async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    const now = new Date();

    if (isDbConnected()) {
      const alert = await Alert.findByIdAndUpdate(
        id,
        {
          status: 'RESOLVED',
          resolvedAt: now,
          notes: req.body.notes || 'Acknowledged and handled by caregiver',
        },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }

      const io = req.app.get('io');
      if (io) io.emit('alert:resolved', alert);

      return res.json({ success: true, message: 'Alert resolved', data: alert });
    }

    // In-Memory
    const alert = inMemoryAlerts.find((a) => a._id === id || a.id === id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = now.toISOString();
    alert.notes = req.body.notes || 'Acknowledged and handled by caregiver';

    const io = req.app.get('io');
    if (io) io.emit('alert:resolved', alert);

    return res.json({ success: true, message: 'Alert resolved', data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/alerts/:id/false-alarm
 */
export async function markFalseAlarm(req, res, next) {
  try {
    const { id } = req.params;
    const now = new Date();

    if (isDbConnected()) {
      const alert = await Alert.findByIdAndUpdate(
        id,
        {
          status: 'FALSE_ALARM',
          resolvedAt: now,
          notes: req.body.notes || 'Marked as false alarm by guardian',
        },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }

      const io = req.app.get('io');
      if (io) io.emit('alert:resolved', alert);

      return res.json({ success: true, message: 'Alert marked as false alarm', data: alert });
    }

    // In-Memory
    const alert = inMemoryAlerts.find((a) => a._id === id || a.id === id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alert.status = 'FALSE_ALARM';
    alert.resolvedAt = now.toISOString();
    alert.notes = req.body.notes || 'Marked as false alarm by guardian';

    const io = req.app.get('io');
    if (io) io.emit('alert:resolved', alert);

    return res.json({ success: true, message: 'Alert marked as false alarm', data: alert });
  } catch (error) {
    next(error);
  }
}
