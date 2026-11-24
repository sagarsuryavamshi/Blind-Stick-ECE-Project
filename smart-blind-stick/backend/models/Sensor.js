import mongoose from 'mongoose';

/**
 * Sensor Telemetry Model
 * Stores readings transmitted by ESP32 microcontrollers.
 * Retention Policy:
 * - Telemetry is partitioned with a TTL (Time-To-Live) index of 30 days.
 * - This ensures continuous real-time data storage without infinite growth.
 * - Emergency alerts and notification logs are kept in separate collections
 *   without auto-expiration to maintain a permanent legal/caregiver audit trail.
 */

const sensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    frontDistance: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    leftDistance: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    rightDistance: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    waterDetected: {
      type: Boolean,
      required: true,
      default: false,
    },
    fallDetected: {
      type: Boolean,
      required: true,
      default: false,
    },
    batteryLevel: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: null, // Nullable to properly reflect ESP32 devices without ADC battery measurement
    },
    movementStatus: {
      type: String,
      enum: ['Active Walking', 'Standing Still', 'Rapid Tilt', 'Stationary', 'Unknown'],
      default: 'Active Walking',
    },
    accel: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 9.81 },
    },
    gyro: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient range queries per device
sensorSchema.index({ deviceId: 1, timestamp: -1 });

// TTL retention: Automatically deletes ordinary telemetry older than 30 days
sensorSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Sensor = mongoose.model('Sensor', sensorSchema);
