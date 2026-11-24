import mongoose from 'mongoose';

/**
 * Notification Log Model
 * Tracks all outbound SMS and Voice attempts, hardware delivery receipts,
 * GSM / provider metadata, and communication error logs.
 * Kept strictly isolated from sensor telemetry to preserve permanent audit records.
 */

const notificationLogSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      default: null,
      index: true,
    },
    contactId: {
      type: String,
      default: null,
      index: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    destinationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['SMS', 'VOICE'],
      index: true,
    },
    provider: {
      type: String,
      default: 'HARDWARE_GSM_PENDING',
    },
    providerSid: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      required: true,
      // SMS: queued, sent, delivered, failed, undelivered, simulated, pending_gsm
      // Voice: initiated, ringing, answered, completed, busy, failed, no-answer, simulated, pending_gsm
      index: true,
    },
    messageContent: {
      type: String,
      default: '',
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

notificationLogSchema.index({ createdAt: -1 });

export const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
