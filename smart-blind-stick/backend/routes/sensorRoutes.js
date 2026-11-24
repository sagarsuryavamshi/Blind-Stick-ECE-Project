import express from 'express';
import {
  postSensorData,
  getLatestSensorData,
  getSensorHistory,
  getHardwareComponents,
} from '../controllers/sensorController.js';
import { verifyDeviceAuth } from '../middleware/auth.js';

const router = express.Router();

// Device telemetry endpoints
router.post('/data', verifyDeviceAuth, postSensorData);
router.get('/latest', getLatestSensorData);
router.get('/history', getSensorHistory);
router.get('/hardware-components', getHardwareComponents);

export default router;
