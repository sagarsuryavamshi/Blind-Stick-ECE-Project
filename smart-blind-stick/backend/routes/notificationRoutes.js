import express from 'express';
import { notificationService } from '../services/notificationService.js';
import { protectCaregiver } from '../middleware/caregiverAuth.js';

const router = express.Router();

/**
 * GET /api/notifications/history
 * Returns recent emergency notification attempts and hardware audit history
 */
router.get('/history', protectCaregiver, async (req, res, next) => {
  try {
    const logs = await notificationService.getHistory(50);
    res.json({
      success: true,
      count: logs.length,
      gateway: 'HARDWARE_GSM_PENDING',
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
