# SmartGuard PRO – Smart Blind Stick IoT Assistive Platform

Production-ready IoT monitoring dashboard and cloud telemetry backend for an intelligent assistive blind stick, built for visually impaired mobility and real-time guardian oversight.

---

## 📁 Repository Structure

```text
smart-blind-stick/
├── frontend/                     # React + Vite Healthcare SaaS Dashboard
│   ├── src/                      # UI Components, Pages, Context, Services
│   │   ├── pages/                # Overview, Live Radar, Emergency Alerts, Hardware Components
│   │   ├── services/             # Centralized API & Socket.IO clients
│   │   └── context/              # Device and telemetry state provider
│   ├── public/                   # Static branding and icon assets
│   ├── vercel.json               # Vercel SPA rewrite configuration
│   ├── .env.example              # Frontend environment variables template
│   └── package.json
│
├── backend/                      # Node.js + Express + MongoDB Atlas Backend
│   ├── config/                   # MongoDB Atlas Mongoose connection
│   ├── controllers/              # Sensor telemetry, emergency alerts, contacts
│   ├── models/                   # Sensor (TTL: 30d), Alert, Contact, NotificationLog
│   ├── routes/                   # RESTful endpoints with Zod request validation
│   ├── services/                 # Device heartbeat monitor & Hardware inventory health
│   ├── middleware/               # Device token auth, JWT auth, Helmet, Rate limiter
│   ├── server.js                 # HTTP + WebSocket entrypoint (0.0.0.0:PORT)
│   ├── .env.example              # Backend environment variables template
│   └── package.json
│
├── firmware/                     # ESP32 Microcontroller C++ / Arduino Firmware
│   └── firmware_esp32_smart_stick.ino
│
└── README.md
```

---

## 🚀 Cloud Deployment Instructions

### 1. Render Deployment (Backend Web Service)
- **Repository**: `https://github.com/sagarsuryavamshi/Blind-Stick-ECE-Project`
- **Root Directory**: `smart-blind-stick/backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Endpoint**: `/api/health`
- **Environment Variables**:
  | Variable | Description | Example / Note |
  |---|---|---|
  | `NODE_ENV` | Environment mode | `production` |
  | `PORT` | Auto-provided by Render | Do not hardcode, automatically binds to `0.0.0.0` |
  | `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://user:pass@cluster.mongodb.net/smartguard` |
  | `FRONTEND_URL` | Deployed Vercel URL for CORS | `https://your-app.vercel.app` |
  | `DEVICE_AUTH_TOKEN`| ESP32 HTTP header `x-device-token` | `smartguard_esp32_secret_token_2026` |
  | `DEVICE_ID` | Registered device identifier | `BLINDSTICK001` |
  | `JWT_SECRET` | Secret token for Caregiver JWT session | Random 32+ character string |

---

### 2. Vercel Deployment (Frontend SPA)
- **Repository**: `https://github.com/sagarsuryavamshi/Blind-Stick-ECE-Project`
- **Root Directory**: `smart-blind-stick/frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  | Variable | Description | Example |
  |---|---|---|
  | `VITE_API_URL` | Public URL of your deployed Render backend | `https://smartguard-backend.onrender.com` |
  | `VITE_SOCKET_URL` | Socket.IO stream URL (defaults to `VITE_API_URL` if omitted) | `https://smartguard-backend.onrender.com` |

---

## 🛠️ Official Hardware Components & Monitoring

| Component | Qty | Purpose | Monitoring Status |
|---|---:|---|---|
| **ESP32 DevKit V1** | 1 | Microcontroller & Wi-Fi node | **ONLINE / OFFLINE** (Heartbeat monitored) |
| **HC-SR04 Ultrasonic (Front)** | 1 | Corridor obstacle radar | **ONLINE / WARNING** (Trig 23, Echo 22) |
| **HC-SR04 Ultrasonic (Left)** | 1 | Left 45° shoulder sweep | **ONLINE / WARNING** (Trig 19, Echo 18) |
| **HC-SR04 Ultrasonic (Right)** | 1 | Right 45° shoulder sweep | **ONLINE / WARNING** (Trig 5, Echo 17) |
| **Moisture Detection Sensor** | 1 | Ground puddle / water detector | **ONLINE / WARNING** (ADC1 GPIO 34) |
| **MPU6050 6-Axis IMU** | 1 | Orientation & fall detection | **ONLINE / WARNING** (I2C SDA 21, SCL 19) |
| **MP3-TF-16P V3.0** | 1 | DFPlayer voice & alert cues | **ONLINE** (UART2 RX 16, TX 4) |
| **16Ω, 0.25W Speaker** | 1 | Acoustic sound output | **NOT MONITORED** (Passive transducer) |
| **SIM900A GSM Module** | 1 | Offline direct emergency SMS & calls | **NOT CONFIGURED** (Hardware driver scheduled) |
| **Power Bank** | 1 | 5V DC power source | **NOT MONITORED** (No ADC divider wired) |
| **Breadboard & Resistors** | - | Circuit prototyping & pull-ups | **NOT MONITORED** (Passive components) |
| **Connecting Cables** | - | Interconnects | **NOT MONITORED** (Passive wiring) |

---

## 🔒 Security & Privacy Standards
- All secret credentials, MongoDB URIs, and JWT keys are managed strictly via environment variables.
- All `.env` files are ignored by Git. Only `.env.example` templates are tracked.
- Telemetry retention policy: 30-day MongoDB TTL index on `sensors` collection ensures bounded storage growth while keeping emergency alert audit logs permanent.
