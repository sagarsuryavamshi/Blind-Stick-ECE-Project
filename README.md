# Smart Blind Stick – Intelligent Assistive Safety Monitoring System (Blind-Stick-ECE-Project)

A premium, production-quality IoT monitoring platform and emergency dispatch system designed for visually impaired individuals.

## 🌟 Hardware Architecture & Components

The hardware node is built around an **ESP32** microcontroller running low-latency FreeRTOS/Arduino C++ firmware, connected to:
- **3x HC-SR04 Ultrasonic Transducers**:
  - **Front (0°)**: Forward walking path obstacle clearance.
  - **Left (45°)**: Left shoulder & diagonal obstacle detection.
  - **Right (45°)**: Right shoulder & diagonal obstacle detection.
- **MPU6050 6-Axis Motion Tracking**:
  - Accelerometer (X, Y, Z) & Gyroscope for sudden fall impacts, disorientation, and horizontal lying state detection.
- **Electrolytic Moisture Sensor Probe**:
  - Ground-level water puddle and liquid hazard detection.
- **DFPlayer Mini MP3 Audio Module & 16-Ohm Speaker**:
  - Stereo spatial audio cues, caution beeps, and siren tones played directly to the user.

---

## 🎨 UI/UX Design System

Strict adherence to a high-end, bright healthcare IoT aesthetic:
- **Light Theme**: Crisp white and slate off-white surfaces (`bg-slate-50`, `bg-white`).
- **Primary Colors**: Emerald green (`#059669`) and deep teal (`#0d9488`).
- **Secondary Colors**: Sky blue (`#0284c7`) and soft cyan (`#06b6d4`).
- **Warning Accents**: Warm amber (`#d97706`).
- **Emergency Accents**: Coral red (`#e11d48`).
- **Typography**: Inter & Plus Jakarta Sans.
- **Zero Dark Purple / Cyberpunk Gimmicks**: Designed like a funded medical technology product.

---

## 🚀 Running the Project

### 1. Prerequisites
- Node.js v18+ (tested on Node v26)
- npm v9+

### 2. Start the Backend API & WebSocket Server
```bash
cd server
npm install
npm run dev # or node server.js
```
The server will start on `http://localhost:5001`.

### 3. Start the Frontend React Client
```bash
cd client
npm install
npm run dev
```
Open your browser to: **`http://localhost:5173`**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health & connected WebSocket client status |
| `GET` | `/api/sensors/latest` | Retrieve current telemetry and safety state |
| `POST` | `/api/sensors/data` | ESP32 telemetry ingestion endpoint |
| `GET` | `/api/alerts` | Query active/historical safety alerts (filtered by severity/status) |
| `POST` | `/api/alerts` | Trigger manual SOS broadcast or test alert |
| `PUT` | `/api/alerts/:id/resolve`| Resolve or cancel false alarm |
| `GET` | `/api/contacts` | List emergency guardians |
| `POST` | `/api/contacts` | Register emergency contact with +91 number |
| `PUT` | `/api/contacts/:id` | Update contact info or primary toggle |
| `DELETE`| `/api/contacts/:id`| Remove contact |
| `POST` | `/api/contacts/:id/test-sms` | Test telecom SMS delivery |
| `GET` | `/api/timeline` | Activity history event stream |

### Sample ESP32 Telemetry Ingestion Payload
```json
{
  "deviceId": "BLINDSTICK001",
  "frontDistance": 45,
  "leftDistance": 80,
  "rightDistance": 30,
  "waterDetected": false,
  "fallDetected": false,
  "batteryLevel": 85
}
```

---

## 📱 SMS Gateway Integration (MSG91 / Fast2SMS)

In `server/.env`:
```env
SMS_GATEWAY_PROVIDER=msg91 # or mock_msg91
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=BLNDST
MSG91_TEMPLATE_ID=your_template_id
SMS_ENABLED=true
```
- **Anti-Spam & Duplicate Shielding**: Critical alerts have a 60-second duplicate throttle cooldown.
- **Selective Notification**: Obstacles and puddles warn the user through in-stick audio cues and do **not** spam contacts; verified falls and manual SOS triggers dispatch instant SMS notifications to guardians.
- **False Alarm Cancellation**: Caregivers or users can flag an alert as a false alarm, resetting emergency status across all dashboards.
>>>>>>> e0343ae (feat: complete SmartGuard PRO platform with hardware inventory, offline emergency architecture, and real-time IoT monitoring)
