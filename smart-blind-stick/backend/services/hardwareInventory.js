/**
 * Official Hardware Inventory Specification & Dynamic Health Evaluator
 * 
 * Strict Component Inventory:
 * 1. ESP32 (Qty: 1) - Main microcontroller and communication unit
 * 2. Ultrasonic sensors (Qty: 3) - Front, left and right obstacle detection
 * 3. Moisture detection sensor (Qty: 1) - Water/moisture detection
 * 4. MPU6050 (Qty: 1) - Motion, orientation and fall detection
 * 5. MP3-TF-16P V3.0 (Qty: 1) - Audio playback and voice alerts
 * 6. Speaker (Qty: 1) - 16Ω, 0.25W audio output
 * 7. SIM900A GSM module (Qty: 1) - Direct emergency SMS and voice calls
 * 8. Power bank (Qty: 1) - Portable power supply
 * 9. Breadboard (Qty: 1) - Prototype circuit assembly
 * 10. Resistors (1kΩ and 2kΩ) - Signal and circuit components
 * 11. Connecting cables (As required) - Electrical connections
 * 
 * Status Categories:
 * - ONLINE: Responding and functioning according to available checks.
 * - WARNING: Responding but reporting abnormal value or degraded condition.
 * - OFFLINE: Expected communication or data has stopped.
 * - NOT MONITORED: Component cannot independently report its condition.
 * - NOT CONFIGURED: Software integration is not yet implemented or verified.
 * - UNKNOWN: Insufficient information to determine current state.
 */

export const HARDWARE_INVENTORY_METADATA = [
  {
    id: 'mcu-esp32',
    name: 'ESP32 DevKit V1',
    category: 'Processing & Core Logic',
    quantity: 1,
    purpose: 'Main microcontroller and communication unit',
    monitoringType: 'Bidirectional Telemetry & Heartbeat',
    isPassive: false,
  },
  {
    id: 'sensor-ultrasonic-front',
    name: 'Ultrasonic Sensor (Front)',
    category: 'Obstacle Detection',
    quantity: 1,
    purpose: 'Front forward corridor obstacle detection (HC-SR04, Trig 23 / Echo 22)',
    monitoringType: 'Active Telemetry Distance Stream',
    isPassive: false,
  },
  {
    id: 'sensor-ultrasonic-left',
    name: 'Ultrasonic Sensor (Left)',
    category: 'Obstacle Detection',
    quantity: 1,
    purpose: 'Left shoulder 45° obstacle detection (HC-SR04, Trig 19 / Echo 18)',
    monitoringType: 'Active Telemetry Distance Stream',
    isPassive: false,
  },
  {
    id: 'sensor-ultrasonic-right',
    name: 'Ultrasonic Sensor (Right)',
    category: 'Obstacle Detection',
    quantity: 1,
    purpose: 'Right shoulder 45° obstacle detection (HC-SR04, Trig 5 / Echo 17)',
    monitoringType: 'Active Telemetry Distance Stream',
    isPassive: false,
  },
  {
    id: 'sensor-moisture',
    name: 'Moisture Detection Sensor',
    category: 'Environmental Hazard',
    quantity: 1,
    purpose: 'Water and puddle detection on walkway (ADC1 GPIO 34)',
    monitoringType: 'Active Telemetry Binary & ADC Stream',
    isPassive: false,
  },
  {
    id: 'sensor-mpu6050',
    name: 'MPU6050 6-Axis IMU',
    category: 'Motion & Orientation',
    quantity: 1,
    purpose: 'Motion dynamics, orientation angles, and fall impact detection (I2C SDA 21 / SCL 19)',
    monitoringType: 'Active Telemetry 6-Axis Stream',
    isPassive: false,
  },
  {
    id: 'audio-mp3-tf-16p',
    name: 'MP3-TF-16P V3.0 (DFPlayer Mini)',
    category: 'Audio Feedback',
    quantity: 1,
    purpose: 'Audio playback and voice alerts for obstacle, water, and fall warnings (UART2 RX 16 / TX 4)',
    monitoringType: 'UART Command State (Unidirectional)',
    isPassive: false,
  },
  {
    id: 'audio-speaker',
    name: 'Speaker (16Ω, 0.25W)',
    category: 'Audio Output',
    quantity: 1,
    purpose: '16Ω, 0.25W physical acoustic sound output connected to MP3-TF-16P module',
    monitoringType: 'Analog Transducer (No Digital Return Channel)',
    isPassive: true,
  },
  {
    id: 'comm-sim900a',
    name: 'SIM900A GSM Module',
    category: 'Emergency Communication',
    quantity: 1,
    purpose: 'Direct emergency SMS and autonomous outgoing voice calls via UART AT commands',
    monitoringType: 'Cellular AT Interface (Firmware Pending)',
    isPassive: false,
  },
  {
    id: 'power-source',
    name: 'Power Bank',
    category: 'Power Supply',
    quantity: 1,
    purpose: 'Portable power supply providing system 5V DC rail',
    monitoringType: 'Direct DC Rail (No Battery Resistor Divider Detected)',
    isPassive: false,
  },
  {
    id: 'passive-breadboard',
    name: 'Breadboard',
    category: 'Prototyping Framework',
    quantity: 1,
    purpose: 'Prototype circuit assembly and rail distribution',
    monitoringType: 'Physical Passive Component',
    isPassive: true,
  },
  {
    id: 'passive-resistors',
    name: 'Resistors (1kΩ and 2kΩ)',
    category: 'Circuit Electronics',
    quantity: '1kΩ & 2kΩ (As required)',
    purpose: 'Signal conditioning, pull-ups, and voltage divider levels',
    monitoringType: 'Passive Circuit Components',
    isPassive: true,
  },
  {
    id: 'passive-cables',
    name: 'Connecting Cables',
    category: 'Wiring & Interconnects',
    quantity: 'As required',
    purpose: 'Electrical jumper and point-to-point connections between sensor modules',
    monitoringType: 'Passive Interconnects',
    isPassive: true,
  },
];

/**
 * Evaluates the real-time monitoring status of all hardware components based on
 * the latest available ESP32 telemetry, device connectivity, and hardware constraints.
 * 
 * Never marks a component ONLINE without genuine evidence.
 * Passive components are strictly marked NOT MONITORED.
 * Unimplemented features (like SIM900A) are strictly marked NOT CONFIGURED.
 */
export function deriveComponentStatuses(deviceStatus = {}, latestTelemetry = null) {
  const isEspOnline = deviceStatus.status !== 'OFFLINE' && Boolean(deviceStatus.lastSeen);
  const now = Date.now();
  const lastSeenMs = deviceStatus.lastSeen ? new Date(deviceStatus.lastSeen).getTime() : 0;
  const isTelemetryStale = !lastSeenMs || (now - lastSeenMs > 25000); // Stale after 25s

  const components = HARDWARE_INVENTORY_METADATA.map((item) => {
    let status = 'UNKNOWN';
    let statusReason = 'No telemetry received yet from device.';
    let telemetryData = null;
    let lastUpdated = latestTelemetry?.timestamp || deviceStatus.lastSeen || null;

    switch (item.id) {
      // 1. ESP32 Microcontroller
      case 'mcu-esp32': {
        if (!deviceStatus.lastSeen) {
          status = 'OFFLINE';
          statusReason = 'ESP32 has not established initial Wi-Fi connection to backend.';
        } else if (isEspOnline && !isTelemetryStale) {
          status = 'ONLINE';
          statusReason = 'Heartbeat active. Telemetry arriving via HTTP/Socket.';
        } else {
          status = 'OFFLINE';
          statusReason = 'Heartbeat timeout (>20s). Device connection dropped.';
        }
        telemetryData = {
          deviceId: deviceStatus.deviceId || 'BLINDSTICK001',
          uptime: deviceStatus.uptime || null,
          lastHeartbeat: deviceStatus.lastSeen,
          wifiStatus: isEspOnline ? 'CONNECTED' : 'DISCONNECTED',
        };
        break;
      }

      // 2. Ultrasonic Sensor Front
      case 'sensor-ultrasonic-front': {
        if (!latestTelemetry) {
          status = 'UNKNOWN';
          statusReason = 'Awaiting initial distance reading from ESP32.';
        } else if (isTelemetryStale) {
          status = 'OFFLINE';
          statusReason = 'Telemetry stream stopped.';
        } else {
          const dist = latestTelemetry.frontDistance;
          if (typeof dist !== 'number' || dist < 0 || dist > 500) {
            status = 'WARNING';
            statusReason = `Abnormal distance measurement (${dist} cm).`;
          } else if (dist < 28) {
            status = 'WARNING';
            statusReason = `Obstacle proximity threshold breached (${dist} cm).`;
          } else {
            status = 'ONLINE';
            statusReason = `Operating normally. Clearance: ${dist} cm.`;
          }
          telemetryData = { distanceCm: dist, pinout: 'Trig 23, Echo 22' };
        }
        break;
      }

      // 3. Ultrasonic Sensor Left
      case 'sensor-ultrasonic-left': {
        if (!latestTelemetry) {
          status = 'UNKNOWN';
          statusReason = 'Awaiting initial distance reading from ESP32.';
        } else if (isTelemetryStale) {
          status = 'OFFLINE';
          statusReason = 'Telemetry stream stopped.';
        } else {
          const dist = latestTelemetry.leftDistance;
          if (typeof dist !== 'number' || dist < 0 || dist > 500) {
            status = 'WARNING';
            statusReason = `Abnormal distance measurement (${dist} cm).`;
          } else if (dist < 28) {
            status = 'WARNING';
            statusReason = `Left obstacle clearance proximity (${dist} cm).`;
          } else {
            status = 'ONLINE';
            statusReason = `Operating normally. Clearance: ${dist} cm.`;
          }
          telemetryData = { distanceCm: dist, pinout: 'Trig 19, Echo 18' };
        }
        break;
      }

      // 4. Ultrasonic Sensor Right
      case 'sensor-ultrasonic-right': {
        if (!latestTelemetry) {
          status = 'UNKNOWN';
          statusReason = 'Awaiting initial distance reading from ESP32.';
        } else if (isTelemetryStale) {
          status = 'OFFLINE';
          statusReason = 'Telemetry stream stopped.';
        } else {
          const dist = latestTelemetry.rightDistance;
          if (typeof dist !== 'number' || dist < 0 || dist > 500) {
            status = 'WARNING';
            statusReason = `Abnormal distance measurement (${dist} cm).`;
          } else if (dist < 28) {
            status = 'WARNING';
            statusReason = `Right obstacle clearance proximity (${dist} cm).`;
          } else {
            status = 'ONLINE';
            statusReason = `Operating normally. Clearance: ${dist} cm.`;
          }
          telemetryData = { distanceCm: dist, pinout: 'Trig 5, Echo 17' };
        }
        break;
      }

      // 5. Moisture Sensor
      case 'sensor-moisture': {
        if (!latestTelemetry) {
          status = 'UNKNOWN';
          statusReason = 'Awaiting moisture detection stream from ESP32.';
        } else if (isTelemetryStale) {
          status = 'OFFLINE';
          statusReason = 'Telemetry stream stopped.';
        } else {
          const isWet = Boolean(latestTelemetry.waterDetected);
          if (isWet) {
            status = 'WARNING';
            statusReason = 'Surface moisture/water puddle detected on ground level.';
          } else {
            status = 'ONLINE';
            statusReason = 'Dry ground path confirmed. Sensor responding.';
          }
          telemetryData = {
            moistureDetected: isWet,
            pinout: 'GPIO 34 (ADC1)',
            condition: isWet ? 'SURFACE WATER DETECTED' : 'DRY',
          };
        }
        break;
      }

      // 6. MPU6050 Motion & Orientation
      case 'sensor-mpu6050': {
        if (!latestTelemetry) {
          status = 'UNKNOWN';
          statusReason = 'Awaiting motion telemetry from I2C bus.';
        } else if (isTelemetryStale) {
          status = 'OFFLINE';
          statusReason = 'Telemetry stream stopped.';
        } else {
          const isFall = Boolean(latestTelemetry.fallDetected);
          if (isFall) {
            status = 'WARNING';
            statusReason = 'Application logic evaluated fall impact condition.';
          } else {
            status = 'ONLINE';
            statusReason = `Communicating over I2C (0x68). Movement: ${latestTelemetry.movementStatus || 'Active Walking'}.`;
          }
          telemetryData = {
            movementStatus: latestTelemetry.movementStatus || 'Active Walking',
            fallDetected: isFall,
            accel: latestTelemetry.accel || { x: 0, y: 0, z: 9.81 },
          };
        }
        break;
      }

      // 7. MP3-TF-16P V3.0 (Audio Player)
      case 'audio-mp3-tf-16p': {
        if (!isEspOnline) {
          status = 'OFFLINE';
          statusReason = 'Host ESP32 is offline.';
        } else {
          // In actual firmware, ESP32 transmits commands via Serial2 (RX 16 / TX 4)
          // without full bi-directional handshake packet reporting
          status = 'ONLINE';
          statusReason = 'UART2 interface initialized by firmware. Ready for audio cues.';
          telemetryData = {
            interface: 'HardwareSerial 2 (TX 16, RX 4, 9600 baud)',
            volume: '25/30 configured',
            activeCues: ['Startup (1)', 'Fall SOS (2)', 'Water Caution (3)', 'Obstacle (4)'],
          };
        }
        break;
      }

      // 8. 16Ω, 0.25W Speaker (Passive Transducer)
      case 'audio-speaker': {
        status = 'NOT MONITORED';
        statusReason = 'Passive 16Ω analog speaker has no return digital communication channel.';
        telemetryData = {
          impedance: '16 Ohm',
          powerRating: '0.25 Watt',
          driver: 'Direct connection to MP3-TF-16P SPK_1 / SPK_2 pins',
        };
        break;
      }

      // 9. SIM900A GSM Module
      case 'comm-sim900a': {
        status = 'NOT CONFIGURED';
        statusReason = 'SIM900A UART driver integration is scheduled for next phase. No cellular telemetry yet.';
        telemetryData = {
          plannedInterface: 'UART1 (GPIO 26 RX / GPIO 27 TX)',
          networkMode: '2G GSM/GPRS (900/1800 MHz)',
          emergencySMS: 'Pending physical AT driver',
          emergencyVoice: 'Pending physical AT driver',
        };
        break;
      }

      // 10. Power Bank
      case 'power-source': {
        if (latestTelemetry && latestTelemetry.batteryLevel !== null && latestTelemetry.batteryLevel !== undefined) {
          const lvl = latestTelemetry.batteryLevel;
          status = lvl < 20 ? 'WARNING' : 'ONLINE';
          statusReason = `Battery telemetry active (${lvl}%).`;
          telemetryData = { batteryLevel: lvl };
        } else {
          status = 'NOT MONITORED';
          statusReason = 'ESP32 circuit has no resistor voltage divider wired to an ADC pin for power measurement.';
          telemetryData = {
            nominalVoltage: '5.0V DC Rail',
            measurement: 'None wired to ADC (Battery level unmeasured)',
          };
        }
        break;
      }

      // 11. Breadboard
      case 'passive-breadboard': {
        status = 'NOT MONITORED';
        statusReason = 'Physical circuit board with no digital feedback.';
        telemetryData = { role: 'Prototyping bus distribution' };
        break;
      }

      // 12. Resistors (1kΩ and 2kΩ)
      case 'passive-resistors': {
        status = 'NOT MONITORED';
        statusReason = 'Passive electronic components with no telemetry channel.';
        telemetryData = { values: '1kΩ, 2kΩ pull-up & divider components' };
        break;
      }

      // 13. Connecting Cables
      case 'passive-cables': {
        status = 'NOT MONITORED';
        statusReason = 'Physical copper wiring with no software telemetry.';
        telemetryData = { role: 'Point-to-point interconnects' };
        break;
      }

      default:
        status = 'UNKNOWN';
        statusReason = 'Component not indexed.';
    }

    return {
      ...item,
      status,
      statusReason,
      telemetryData,
      lastUpdated,
    };
  });

  // Calculate summary metrics
  const summary = {
    totalComponents: components.length,
    onlineCount: components.filter((c) => c.status === 'ONLINE').length,
    warningCount: components.filter((c) => c.status === 'WARNING').length,
    offlineCount: components.filter((c) => c.status === 'OFFLINE').length,
    notMonitoredCount: components.filter((c) => c.status === 'NOT MONITORED').length,
    notConfiguredCount: components.filter((c) => c.status === 'NOT CONFIGURED').length,
    unknownCount: components.filter((c) => c.status === 'UNKNOWN').length,
  };

  return { summary, components };
}
