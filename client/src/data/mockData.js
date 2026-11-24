// High fidelity mock data for SmartGuard
// ALL simulated data is explicitly tagged with isDemoData: true

export const INITIAL_DEVICE_STATE = {
  deviceId: 'BLINDSTICK001',
  deviceName: 'SmartGuard Pro',
  isDemoData: true,
  status: 'ONLINE', // ONLINE | OFFLINE | WARNING | EMERGENCY
  lastSeen: new Date().toISOString(),
  batteryLevel: 84, // simulated percentage
  totalObstaclesDetected: 142,
  totalEmergencyAlerts: 3,
  connectionQuality: 'Excellent (Wi-Fi 802.11 b/g/n)',
  sensors: {
    frontDistance: 82, // cm
    leftDistance: 115, // cm
    rightDistance: 98,  // cm
    waterDetected: false,
    movementStatus: 'Active Walking', // Active Walking | Standing Still | Rapid Tilt
    fallDetected: false,
    accel: { x: 0.04, y: 0.09, z: 9.81 },
    gyro: { x: 0.02, y: -0.01, z: 0.03 },
    temperature: 28.5
  },
  audioModule: {
    state: 'READY',
    device: 'DFPlayer Mini + 16Ω Speaker',
    volume: 24,
    feedbackActive: true
  },
  sensorHealth: [
    { id: 'esp32', name: 'ESP32 MCU Node', spec: '240MHz Dual-Core', status: 'Optimal', health: 100 },
    { id: 'front', name: 'Front HC-SR04 Sensor (0°)', spec: 'Front clearance path', status: 'Optimal', health: 98 },
    { id: 'left', name: 'Left HC-SR04 Sensor (45°)', spec: 'Left shoulder clearance', status: 'Optimal', health: 96 },
    { id: 'right', name: 'Right HC-SR04 Sensor (45°)', spec: 'Right shoulder clearance', status: 'Optimal', health: 97 },
    { id: 'water', name: 'Electrolytic Moisture Sensor', spec: 'Puddle & liquid detector', status: 'Optimal', health: 95 },
    { id: 'mpu', name: 'MPU6050 Gyro & Accelerometer', spec: '6-Axis motion & fall trigger', status: 'Optimal', health: 99 },
    { id: 'audio', name: 'DFPlayer Mini Audio & Speaker', spec: 'Acoustic cues & siren', status: 'Optimal', health: 100 }
  ]
};

export const INITIAL_CONTACTS = [
  {
    id: 'c1',
    name: 'Dr. Ramesh Sharma',
    relationship: 'Father / Primary Guardian',
    phoneNumber: '+91 98765 43210',
    rawPhone: '+919876543210',
    email: 'ramesh.sharma@healthmail.in',
    isPrimary: true,
    notifySms: true,
    notifyCall: true,
    priority: 1,
    createdAt: '2026-11-05T08:30:00.000Z'
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    relationship: 'Sister',
    phoneNumber: '+91 98112 23344',
    rawPhone: '+919811223344',
    email: 'priya.sharma@outlook.com',
    isPrimary: false,
    notifySms: true,
    notifyCall: false,
    priority: 2,
    createdAt: '2026-11-12T14:15:00.000Z'
  },
  {
    id: 'c3',
    name: 'CareAssist 24/7 Response Center',
    relationship: 'Institutional Care Coordinator',
    phoneNumber: '+91 80012 34567',
    rawPhone: '+918001234567',
    email: 'dispatch@careassist.in',
    isPrimary: false,
    notifySms: true,
    notifyCall: true,
    priority: 3,
    createdAt: '2026-11-18T10:00:00.000Z'
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt_001',
    deviceId: 'BLINDSTICK001',
    isDemoData: true,
    type: 'FALL_DETECTED',
    category: 'Fall Events',
    severity: 'DANGER', // DANGER (Red) | WARNING (Amber)
    title: 'Fall Impact Confirmed (MPU6050)',
    description: 'Sudden high deceleration (3.6G) with sustained horizontal tilt angle (>75°). User remained stationary for 12 seconds.',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    status: 'ACTIVE', // ACTIVE | RESOLVED | FALSE_ALARM
    notificationStatus: 'SMS & Voice Call Dispatched (Simulated)',
    recipient: 'Dr. Ramesh Sharma (+91 98765 43210)',
    locationEstimate: 'Pavement near Sector 4 Park Walkway'
  },
  {
    id: 'alt_002',
    deviceId: 'BLINDSTICK001',
    isDemoData: true,
    type: 'WATER_HAZARD',
    category: 'Water Detections',
    severity: 'WARNING',
    title: 'Deep Water Puddle Detected',
    description: 'Electrolytic moisture sensor base detected surface pooling water >1.5cm depth. DFPlayer sounded track 3 water tone cue.',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    status: 'RESOLVED',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    notificationStatus: 'Local Stick Audio Feedback Only (SMS not required)',
    recipient: null,
    locationEstimate: 'Sidewalk crossing'
  },
  {
    id: 'alt_003',
    deviceId: 'BLINDSTICK001',
    isDemoData: true,
    type: 'OBSTACLE_PROXIMITY',
    category: 'Obstacle Detections',
    severity: 'WARNING',
    title: 'Close Range Obstacle (Front: 18cm)',
    description: 'Front ultrasonic sensor measured clearance under emergency threshold (25cm). High frequency acoustic beep delivered to user.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'RESOLVED',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
    notificationStatus: 'Local Stick Audio Feedback Only',
    recipient: null,
    locationEstimate: 'Commercial plaza doorway'
  },
  {
    id: 'alt_004',
    deviceId: 'BLINDSTICK001',
    isDemoData: true,
    type: 'MANUAL_SOS',
    category: 'Emergency Notifications',
    severity: 'DANGER',
    title: 'Manual Emergency SOS Pressed',
    description: 'User held down physical handle emergency SOS button for 3 seconds. High-decibel speaker siren activated.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: 'RESOLVED',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 25.5).toISOString(),
    notificationStatus: 'SMS Dispatched & Guardian Reached',
    recipient: 'Dr. Ramesh Sharma (+91 98765 43210)',
    locationEstimate: 'Residential lane'
  }
];

export const INITIAL_ACTIVITY_TIMELINE = [
  {
    id: 'act_001',
    category: 'Emergency Notifications',
    type: 'FALL_DETECTED',
    title: 'Fall Detection Incident Triggered',
    description: 'MPU6050 accelerometer recorded vertical drop shockwave. Auto-notification triggered for primary caregiver.',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    severity: 'DANGER',
    isDemoData: true,
    meta: 'SMS Gateway delivery confirmed (Demo)'
  },
  {
    id: 'act_002',
    category: 'Water Detections',
    type: 'WATER_HAZARD',
    title: 'Water Puddle Encounter',
    description: 'Electrolytic moisture sensor detected pooling water. DFPlayer sounded track 3 cue.',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    severity: 'WARNING',
    isDemoData: true,
    meta: 'Sensor resistance: 1240Ω'
  },
  {
    id: 'act_003',
    category: 'Obstacle Detections',
    type: 'OBSTACLE_LEFT',
    title: 'Left Obstacle Cleared (24cm)',
    description: 'Left 45° transducer detected pillar; user redirected rightward successfully.',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    severity: 'WARNING',
    isDemoData: true,
    meta: 'Left HC-SR04 ping'
  },
  {
    id: 'act_004',
    category: 'Obstacle Detections',
    type: 'OBSTACLE_FRONT',
    title: 'Front Low Barrier Detected (28cm)',
    description: 'Front ultrasonic sensor detected low curb. Audio beep sequence delivered.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    severity: 'WARNING',
    isDemoData: true,
    meta: 'Front HC-SR04 ping'
  },
  {
    id: 'act_005',
    category: 'Device Management',
    type: 'DEVICE_HEARTBEAT',
    title: 'Smart Stick Telemetry Handshake',
    description: 'ESP32 Wi-Fi module synchronized data with SmartGuard cloud dashboard. Battery at 84%.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    severity: 'INFO',
    isDemoData: true,
    meta: 'Ping: 42ms'
  }
];

export const SENSOR_ACTIVITY_SERIES = [
  { time: '08:00', front: 120, left: 140, right: 130, obstacles: 1 },
  { time: '09:00', front: 95,  left: 110, right: 105, obstacles: 3 },
  { time: '10:00', front: 45,  left: 80,  right: 60,  obstacles: 8 },
  { time: '11:00', front: 110, left: 130, right: 125, obstacles: 2 },
  { time: '12:00', front: 80,  left: 95,  right: 90,  obstacles: 5 },
  { time: '13:00', front: 65,  left: 70,  right: 85,  obstacles: 6 },
  { time: '14:00', front: 82,  left: 115, right: 98,  obstacles: 4 }
];
