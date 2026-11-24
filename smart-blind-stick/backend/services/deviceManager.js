/**
 * Device Heartbeat & Connection Manager
 * 
 * Requirements:
 * - Tracks actual telemetry pings from ESP32 devices.
 * - Updates device status on successful communication.
 * - Automatically marks a device OFFLINE after 20 seconds of no telemetry.
 * - Broadcasts device:status updates over Socket.IO.
 * - Background interval with clean timer teardown on server shutdown.
 * - NEVER falsely marks ESP32 as online unless actual telemetry is arriving.
 */

class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.checkInterval = null;
    this.io = null;
    this.OFFLINE_THRESHOLD_MS = 20000; // 20 seconds
  }

  init(io) {
    this.io = io;
    // Register default monitored device
    const defaultId = process.env.DEVICE_ID || 'BLINDSTICK001';
    this.devices.set(defaultId, {
      deviceId: defaultId,
      status: 'OFFLINE', // Initial state is strictly OFFLINE until first ping
      lastSeen: null,
      batteryLevel: null,
      warningActive: false,
      emergencyActive: false,
    });

    // Run sweep every 5 seconds
    this.checkInterval = setInterval(() => {
      this.checkStaleDevices();
    }, 5000);

    console.log('🩺 [DeviceManager] Heartbeat monitor initialized (20s offline threshold).');
  }

  /**
   * Called whenever valid sensor telemetry is received from an ESP32.
   */
  recordHeartbeat(deviceId, payload = {}) {
    const now = new Date();
    const existing = this.devices.get(deviceId) || {
      deviceId,
      status: 'OFFLINE',
      lastSeen: null,
      batteryLevel: null,
      warningActive: false,
      emergencyActive: false,
    };

    const prevStatus = existing.status;
    const isEmergency = Boolean(payload.fallDetected);
    const isWarning = Boolean(payload.waterDetected || (payload.frontDistance && payload.frontDistance < 28));

    existing.lastSeen = now.toISOString();
    existing.batteryLevel = payload.batteryLevel ?? existing.batteryLevel;
    existing.status = isEmergency ? 'EMERGENCY' : isWarning ? 'WARNING' : 'ONLINE';
    existing.emergencyActive = isEmergency;
    existing.warningActive = isWarning;

    this.devices.set(deviceId, existing);

    // Broadcast status change or update
    if (this.io) {
      this.io.emit('device:status', {
        deviceId,
        status: existing.status,
        lastSeen: existing.lastSeen,
        batteryLevel: existing.batteryLevel,
        isOnline: true,
      });
    }

    if (prevStatus === 'OFFLINE') {
      console.log(`📶 [DeviceManager] Device ${deviceId} transitioned to ONLINE.`);
    }

    return existing;
  }

  /**
   * Checks for devices that haven't communicated within the 20-second window.
   */
  checkStaleDevices() {
    const now = Date.now();
    for (const [deviceId, device] of this.devices.entries()) {
      if (device.status !== 'OFFLINE' && device.lastSeen) {
        const elapsed = now - new Date(device.lastSeen).getTime();
        if (elapsed > this.OFFLINE_THRESHOLD_MS) {
          device.status = 'OFFLINE';
          console.warn(`⚠️  [DeviceManager] Device ${deviceId} communication timed out (${Math.round(elapsed / 1000)}s). Status marked OFFLINE.`);

          if (this.io) {
            this.io.emit('device:status', {
              deviceId,
              status: 'OFFLINE',
              lastSeen: device.lastSeen,
              batteryLevel: device.batteryLevel,
              isOnline: false,
              timeoutElapsedSeconds: Math.round(elapsed / 1000),
            });
          }
        }
      }
    }
  }

  getDeviceStatus(deviceId) {
    return this.devices.get(deviceId) || {
      deviceId,
      status: 'OFFLINE',
      lastSeen: null,
      batteryLevel: null,
      isOnline: false,
    };
  }

  getAllDevices() {
    return Array.from(this.devices.values());
  }

  shutdown() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🩺 [DeviceManager] Heartbeat monitor cleanly stopped.');
    }
  }
}

export const deviceManager = new DeviceManager();
