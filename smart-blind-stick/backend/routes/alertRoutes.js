import express from 'express';
import {
  getAlerts,
  createAlert,
  resolveAlert,
  markFalseAlarm,
} from '../controllers/alertController.js';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', createAlert);
router.patch('/:id/resolve', resolveAlert);
router.patch('/:id/false-alarm', markFalseAlarm);

export default router;
