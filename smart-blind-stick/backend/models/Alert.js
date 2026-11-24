import mongoose from 'mongoose';

/**
 * Emergency Alert Model
 * Stores verified emergency events and warnings.
 * IMPORTANT: Emergency alerts and notification audit records are NEVER auto-deleted
 * through TTL or telemetry retention, ensuring a permanent historical record.
 */

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: [
        'FALL_DETECTED',
        'WATER_HAZARD',
        'MANUAL_SOS',
        'OBSTACLE_PROXIMITY',
        'CRITICAL_EMERGENCY',
        'SYSTEM_TEST',
      ],
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Fall Events',
        'Water Detections',
        'Obstacle Detections',
        'Emergency Notifications',
        'System Diagnostics',
      ],
      default: 'Emergency Notifications',
    },
    severity: {
      type: String,
      required: true,
      enum: ['DANGER', 'WARNING', 'INFO'],
      default: 'WARNING',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'RESOLVED', 'FALSE_ALARM'],
      default: 'ACTIVE',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notificationStatus: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED', 'SIMULATED', 'NOT_REQUIRED'],
      default: 'NOT_REQUIRED',
    },
    recipient: {
      type: String,
      default: null,
    },
    locationEstimate: {
      type: String,
      default: 'Live Navigation Area',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid filtering by device, status and date
alertSchema.index({ deviceId: 1, status: 1, timestamp: -1 });
alertSchema.index({ severity: 1, timestamp: -1 });

export const Alert = mongoose.model('Alert', alertSchema);
