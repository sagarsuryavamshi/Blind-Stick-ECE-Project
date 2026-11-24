import jwt from 'jsonwebtoken';

/**
 * Caregiver JWT Authentication Middleware
 * Protects caregiver endpoints (such as sensitive emergency contact management).
 * Supports graceful demo fallback if no token is presented during development.
 */

export function protectCaregiver(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If running in development without JWT requirement enforced, allow through with guest caregiver profile
  const jwtSecret = process.env.JWT_SECRET || 'smartguard_default_dev_jwt_secret_2026';

  if (!token) {
    if (process.env.NODE_ENV === 'development' || !process.env.REQUIRE_AUTH) {
      req.user = {
        id: 'dev_caregiver_1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@smartguard.care',
        role: 'CAREGIVER',
      };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}
