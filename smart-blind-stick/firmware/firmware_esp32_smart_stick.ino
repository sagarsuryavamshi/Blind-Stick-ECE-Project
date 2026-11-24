// ESP32 Smart Blind Stick - Arduino / C++ Firmware Code
// Components:
// 1. ESP32 Dev Board
// 2. 3x HC-SR04 Ultrasonic Sensors (Front, Left, Right)
// 3. MPU6050 6-Axis Accelerometer & Gyroscope (I2C)
// 4. Analog/Digital Water Raindrop/Moisture Sensor
// 5. DFPlayer Mini Audio MP3 Module
// 6. 16-Ohm Speaker

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <HardwareSerial.h>
#include <DFRobotDFPlayerMini.h>

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend Server URL
const char* serverEndpoint = "http://YOUR_SERVER_IP:5001/api/sensors/data";
const char* deviceId = "BLINDSTICK001";

// Ultrasonic Pins
#define TRIG_FRONT 23
#define ECHO_FRONT 22
#define TRIG_LEFT  19
#define ECHO_LEFT  18
#define TRIG_RIGHT 5
#define ECHO_RIGHT 17

// Water Sensor Pin
#define WATER_SENSOR_PIN 34 // ADC1 pin

// Fall Detection & MPU6050
MPU6050 mpu;
#define FALL_THRESHOLD_G 2.6
#define TILT_THRESHOLD_DEG 65

// DFPlayer Hardware Serial 2
HardwareSerial mySerial(2);
DFRobotDFPlayerMini myDFPlayer;

unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 800; // ms

long readUltrasonic(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 25000); // 25ms timeout
  if (duration == 0) return 300; // default max distance
  return duration * 0.034 / 2;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 19); // SDA, SCL
  
  pinMode(TRIG_FRONT, OUTPUT);
  pinMode(ECHO_FRONT, INPUT);
  pinMode(TRIG_LEFT, OUTPUT);
  pinMode(ECHO_LEFT, INPUT);
  pinMode(TRIG_RIGHT, OUTPUT);
  pinMode(ECHO_RIGHT, INPUT);
  pinMode(WATER_SENSOR_PIN, INPUT);

  // MPU6050 Init
  mpu.initialize();
  Serial.println(mpu.testConnection() ? "MPU6050 connection successful" : "MPU6050 connection failed");

  // DFPlayer Init
  mySerial.begin(9600, SERIAL_8N1, 16, 4); // RX, TX
  if (myDFPlayer.begin(mySerial)) {
    myDFPlayer.volume(25);
    myDFPlayer.play(1); // Startup sound
  }

  // Connect Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  // Read Distance
  long frontDist = readUltrasonic(TRIG_FRONT, ECHO_FRONT);
  long leftDist = readUltrasonic(TRIG_LEFT, ECHO_LEFT);
  long rightDist = readUltrasonic(TRIG_RIGHT, ECHO_RIGHT);

  // Read Water Sensor
  int waterRaw = analogRead(WATER_SENSOR_PIN);
  bool waterDetected = (waterRaw > 1800);

  // Read Accelerometer for Fall
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  float gX = ax / 16384.0;
  float gY = ay / 16384.0;
  float gZ = az / 16384.0;
  float totalG = sqrt(gX * gX + gY * gY + gZ * gZ);
  bool fallDetected = (totalG > FALL_THRESHOLD_G || abs(gZ) < 0.25);

  // Audio warning cues via DFPlayer
  if (fallDetected) {
    myDFPlayer.play(2); // Fall SOS Audio Cue
  } else if (waterDetected) {
    myDFPlayer.play(3); // Water Caution Cue
  } else if (frontDist < 30) {
    myDFPlayer.play(4); // Front Obstacle Warning Beep
  }

  // Periodic Telemetry Transmission
  if (millis() - lastTelemetryTime > telemetryInterval) {
    lastTelemetryTime = millis();
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverEndpoint);
      http.addHeader("Content-Type", "application/json");

      String payload = "{\"deviceId\":\"" + String(deviceId) + "\",";
      payload += "\"frontDistance\":" + String(frontDist) + ",";
      payload += "\"leftDistance\":" + String(leftDist) + ",";
      payload += "\"rightDistance\":" + String(rightDist) + ",";
      payload += "\"waterDetected\":" + String(waterDetected ? "true" : "false") + ",";
      payload += "\"fallDetected\":" + String(fallDetected ? "true" : "false") + ",";
      payload += "\"batteryLevel\":86}";

      int httpResponseCode = http.POST(payload);
      Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      http.end();
    }
  }
}
