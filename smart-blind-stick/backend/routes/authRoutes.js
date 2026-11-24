import express from 'express';
import { loginCaregiver, getCaregiverProfile } from '../controllers/authController.js';
import { protectCaregiver } from '../middleware/caregiverAuth.js';

const router = express.Router();

router.post('/login', loginCaregiver);
router.get('/profile', protectCaregiver, getCaregiverProfile);

export default router;
