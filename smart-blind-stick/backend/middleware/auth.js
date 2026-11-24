/**
 * Basic Device Authentication Middleware
 * Validates optional x-device-token header against process.env.DEVICE_AUTH_TOKEN
 * For ESP32 hardware authentication.
 */
export function verifyDeviceAuth(req, res, next) {
  const token = req.headers['x-device-token'];
  const configuredToken = process.env.DEVICE_AUTH_TOKEN;

  // In development, if header is omitted, allow request but flag it
  if (!configuredToken) {
    return next();
  }

  // If token is provided, verify it matches
  if (token && token !== configuredToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid device authentication token',
    });
  }

  next();
}
