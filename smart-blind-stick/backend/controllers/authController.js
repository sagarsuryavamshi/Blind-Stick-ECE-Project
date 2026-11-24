import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/database.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'smartguard_default_dev_jwt_secret_2026';
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
    secret,
    { expiresIn: '30d' }
  );
}

export async function loginCaregiver(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    if (isDbConnected()) {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          token: generateToken(user),
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // In-memory demo account
    const demoUser = { id: 'dev_caregiver_1', name: 'Sarah Jenkins', email, role: 'CAREGIVER' };
    return res.json({
      success: true,
      token: generateToken(demoUser),
      user: demoUser,
      demoNote: 'Authenticated using session development mode',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCaregiverProfile(req, res, next) {
  res.json({
    success: true,
    user: req.user,
  });
}
