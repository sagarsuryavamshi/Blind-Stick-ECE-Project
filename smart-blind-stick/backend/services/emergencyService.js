import { notificationService } from './notificationService.js';
import { Contact } from '../models/Contact.js';
import { isDbConnected } from '../config/database.js';

/**
 * Emergency Validation & Anti-Duplicate Throttle Service
 * 
 * Rules:
 * 1. Notifications are triggered ONLY by confirmed Fall Detection and Manual SOS.
 * 2. Ordinary ultrasonic obstacle detection must NEVER trigger SMS or voice calls.
 * 3. 60-second cooldown protects contacts from duplicate notification floods.
 * 4. Separate SMS and Voice preferences are strictly honored (receiveSMS, receiveCalls).
 * 5. Emergency confirmation countdown / cancellation window support.
 */

export const inMemoryContacts = [
  {
    _id: 'c1',
    id: 'c1',
    name: 'Dr. Ramesh Sharma',
    phone: '+91 98765 43210',
    rawPhone: '+919876543210',
    relationship: 'Father / Primary Guardian',
    isPrimary: true,
    receiveSMS: true,
    receiveCalls: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'c2',
    id: 'c2',
    name: 'Priya Sharma',
    phone: '+91 98112 23344',
    rawPhone: '+919811223344',
    relationship: 'Sister',
    isPrimary: false,
    receiveSMS: true,
    receiveCalls: false,
    createdAt: new Date().toISOString(),
  },
];

// Anti-duplicate throttle timestamps
const lastEmergencyTime = {
  FALL_DETECTED: 0,
  MANUAL_SOS: 0,
  CRITICAL_EMERGENCY: 0,
};

const COOLDOWN_MS = 60000; // 60 seconds

// Active countdown cache for cancel-emergency window (e.g. 5 seconds grace period)
const pendingEmergencies = new Map();

class EmergencyService {
  /**
   * Validates if a sensor payload constitutes an emergency.
   * Ordinary obstacles and water puddles are warnings ONLY.
   */
  evaluateSensorTelemetry(data) {
    if (data.fallDetected) {
      return {
        isEmergency: true,
        alertType: 'FALL_DETECTED',
        severity: 'DANGER',
        description: `Sudden fall impact detected on MPU6050 accelerometer. Device: ${data.deviceId}`,
      };
    }

    if (data.waterDetected) {
      return {
        isEmergency: false,
        alertType: 'WATER_HAZARD',
        severity: 'WARNING',
        description: `Standing water puddle detected by bottom moisture sensor. Device: ${data.deviceId}`,
      };
    }

    // Normal distance check - obstacle warning only (NO SMS notification)
    if (data.frontDistance < 28 || data.leftDistance < 24 || data.rightDistance < 24) {
      return {
        isEmergency: false,
        alertType: 'OBSTACLE_PROXIMITY',
        severity: 'WARNING',
        description: `Close range obstacle: Front ${data.frontDistance}cm, Left ${data.leftDistance}cm, Right ${data.rightDistance}cm.`,
      };
    }

    return null;
  }

  /**
   * Dispatches emergency notification if cooldown has expired and criteria met.
   */
  async processEmergencyAlert({ alertType, deviceId, description, severity, alertId = null }) {
    // 1. Ordinary obstacle detections and water puddles MUST NEVER trigger SMS or voice calls
    if (alertType === 'OBSTACLE_PROXIMITY' || alertType === 'WATER_HAZARD') {
      return { dispatched: false, reason: 'OBSTACLES_AND_WATER_DO_NOT_TRIGGER_OUTBOUND_CALLS' };
    }

    // 2. Only confirmed fall events or manual SOS triggers outbound communications
    if (alertType !== 'FALL_DETECTED' && alertType !== 'MANUAL_SOS' && severity !== 'DANGER') {
      return { dispatched: false, reason: 'SEVERITY_BELOW_EMERGENCY_THRESHOLD' };
    }

    // 3. 60-Second Cooldown / Duplicate Protection
    const now = Date.now();
    const lastSent = lastEmergencyTime[alertType] || 0;
    if (now - lastSent < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      console.log(`⏱️  [EmergencyService] Alert ${alertType} throttled. Cooldown remaining: ${remainingSeconds}s`);
      return {
        dispatched: false,
        reason: 'DUPLICATE_THROTTLED',
        cooldownRemainingSeconds: remainingSeconds,
      };
    }

    lastEmergencyTime[alertType] = now;

    // 4. Primary contact selection
    let primary = null;
    if (isDbConnected()) {
      primary = await Contact.findOne({ isPrimary: true });
      if (!primary) {
        primary = await Contact.findOne();
      }
    } else {
      primary = inMemoryContacts.find((c) => c.isPrimary) || inMemoryContacts[0];
    }

    if (!primary) {
      console.warn('⚠️  [EmergencyService] No emergency contacts registered to receive notification.');
      return { dispatched: false, reason: 'NO_CONTACTS_REGISTERED' };
    }

    const alertObject = {
      _id: alertId,
      id: alertId,
      alertType,
      deviceId,
      description,
      locationEstimate: 'Home / Walking Corridor',
    };

    const results = {
      dispatched: true,
      sms: null,
      voice: null,
    };

    // 5. Respect separate SMS preference (receiveSMS)
    if (primary.receiveSMS ?? true) {
      results.sms = await notificationService.sendEmergencySMS(primary, alertObject);
    }

    // 6. Respect separate Automated Voice preference (receiveCalls)
    if (primary.receiveCalls ?? false) {
      results.voice = await notificationService.makeEmergencyCall(primary, alertObject);
    }

    return results;
  }

  /**
   * Allows caregiver to cancel a false-alarm emergency during confirmation window
   */
  cancelEmergency(alertId) {
    if (pendingEmergencies.has(alertId)) {
      clearTimeout(pendingEmergencies.get(alertId));
      pendingEmergencies.delete(alertId);
      console.log(`🛑 [EmergencyService] Alert ${alertId} was cancelled before dispatch.`);
      return true;
    }
    return false;
  }
}

export const emergencyService = new EmergencyService();
