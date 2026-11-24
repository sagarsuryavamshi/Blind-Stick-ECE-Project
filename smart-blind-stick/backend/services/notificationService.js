import { NotificationLog } from '../models/NotificationLog.js';
import { isDbConnected } from '../config/database.js';

/**
 * Normalizes Indian phone number into strict E.164 format (+91XXXXXXXXXX)
 */
export function formatToE164(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phone.startsWith('+')) {
    return `+${digits}`;
  }
  return `+91${digits.slice(-10)}`;
}

/**
 * Notification Service Adapter
 * 
 * Architectural Note:
 * Cloud communication providers (Twilio) have been completely removed.
 * Emergency notifications are designed to be dispatched directly from the ESP32
 * via physical hardware (SIM900A GSM module) without cloud dependence.
 * 
 * This service retains audit logging, history retrieval, and placeholder adapters
 * for recording emergency communication events to MongoDB and Socket.IO.
 */
class NotificationService {
  constructor() {
    this.inMemoryLogs = [];
    this.io = null;
  }

  setIo(io) {
    this.io = io;
  }

  /**
   * Helper to persist notification log to MongoDB Atlas or in-memory fallback
   */
  async logAttempt(record) {
    let saved = null;
    if (isDbConnected()) {
      try {
        saved = await NotificationLog.create(record);
      } catch (err) {
        console.warn('⚠️  [NotificationLog] MongoDB write error:', err.message);
      }
    }

    if (!saved) {
      saved = {
        _id: 'notif_' + Math.random().toString(36).substring(2, 9),
        ...record,
        createdAt: new Date().toISOString(),
      };
    }

    this.inMemoryLogs.unshift(saved);
    if (this.inMemoryLogs.length > 100) this.inMemoryLogs.pop();

    // Broadcast status to frontend via Socket.IO
    if (this.io) {
      this.io.emit('notification:log', saved);
    }

    return saved;
  }

  /**
   * Records emergency SMS dispatch attempt.
   * Reports that cloud APIs are removed and hardware GSM dispatch is pending integration.
   */
  async sendEmergencySMS(contact, alert = {}) {
    const destinationNumber = formatToE164(contact.rawPhone || contact.phone);
    const alertType = alert.alertType || alert.type || 'FALL_DETECTED';
    const deviceId = alert.deviceId || 'BLINDSTICK001';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageBody = `[SMARTGUARD CRITICAL ALERT] Emergency (${alertType}) detected on Smart Stick ${deviceId} at ${timestamp}. Location estimate: ${alert.locationEstimate || 'Live Area'}.`;

    const logRecord = {
      alertId: alert._id || alert.id || null,
      contactId: contact._id || contact.id || null,
      recipientName: contact.name,
      destinationNumber,
      channel: 'SMS',
      provider: 'HARDWARE_GSM_PENDING',
      messageContent: messageBody,
      status: 'pending_gsm',
      providerSid: 'GSM_SMS_' + Date.now(),
      errorDetails: {
        note: 'Twilio removed. Emergency SMS will be dispatched directly by on-device hardware (SIM900A GSM Module).',
      },
    };

    console.log(`📡 [NotificationService] Emergency SMS recorded for ${contact.name} (${destinationNumber}). Hardware GSM pending.`);
    return await this.logAttempt(logRecord);
  }

  /**
   * Records emergency voice call dispatch attempt.
   */
  async makeEmergencyCall(contact, alert = {}) {
    const destinationNumber = formatToE164(contact.rawPhone || contact.phone);
    const alertType = alert.alertType || alert.type || 'FALL_DETECTED';
    const deviceId = alert.deviceId || 'BLINDSTICK001';

    const callScript = `Emergency event ${alertType} detected on device ${deviceId}. Please contact your ward immediately.`;

    const logRecord = {
      alertId: alert._id || alert.id || null,
      contactId: contact._id || contact.id || null,
      recipientName: contact.name,
      destinationNumber,
      channel: 'VOICE',
      provider: 'HARDWARE_GSM_PENDING',
      messageContent: callScript,
      status: 'pending_gsm',
      providerSid: 'GSM_CALL_' + Date.now(),
      errorDetails: {
        note: 'Twilio removed. Outgoing voice calls will be dialed directly by on-device hardware (SIM900A GSM Module).',
      },
    };

    console.log(`📞 [NotificationService] Emergency Voice Call recorded for ${contact.name} (${destinationNumber}). Hardware GSM pending.`);
    return await this.logAttempt(logRecord);
  }

  /**
   * Updates an existing notification record when hardware reports status
   */
  async updateStatus({ providerSid, status, channel, errorDetails = null }) {
    let updated = null;

    if (isDbConnected()) {
      try {
        updated = await NotificationLog.findOneAndUpdate(
          { providerSid },
          {
            $set: {
              status,
              ...(errorDetails && { errorDetails }),
            },
          },
          { new: true }
        );
      } catch (err) {
        console.warn('Error updating status in DB:', err.message);
      }
    }

    // Update in-memory record
    const inMem = this.inMemoryLogs.find((l) => l.providerSid === providerSid);
    if (inMem) {
      inMem.status = status;
      if (errorDetails) inMem.errorDetails = errorDetails;
      updated = inMem;
    }

    // Push real-time status update to frontend
    if (this.io && updated) {
      this.io.emit('notification:status', {
        providerSid,
        status,
        channel,
        errorDetails,
      });
    }

    return updated;
  }

  /**
   * Returns recent notification history
   */
  async getHistory(limit = 50) {
    if (isDbConnected()) {
      try {
        return await NotificationLog.find().sort({ createdAt: -1 }).limit(limit);
      } catch (e) {
        // Fallback to in-memory
      }
    }
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const notificationService = new NotificationService();
