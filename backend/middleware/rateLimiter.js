// Simple in-memory rate limiter for login attempts
// In production, use a proper solution like redis-based rate limiting

const loginAttempts = new Map();
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const rateLimitLogin = (req, res, next) => {
  const identifier = req.body.email || req.ip; // Use email or IP for rate limiting
  const now = Date.now();

  if (!loginAttempts.has(identifier)) {
    loginAttempts.set(identifier, { attempts: [], blockedUntil: null });
  }

  const record = loginAttempts.get(identifier);
  
  // Check if user is currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingTime = Math.ceil((record.blockedUntil - now) / 1000);
    return res.status(429).json({
      message: `Too many login attempts. Please try again in ${remainingTime} seconds.`,
      code: 'RATE_LIMITED',
      retryAfter: remainingTime
    });
  }

  // Remove old attempts outside the window
  record.attempts = record.attempts.filter(time => now - time < ATTEMPT_WINDOW);

  // Add current attempt
  record.attempts.push(now);

  // Check if exceeded max attempts
  if (record.attempts.length > MAX_ATTEMPTS) {
    record.blockedUntil = now + ATTEMPT_WINDOW;
    return res.status(429).json({
      message: `Too many login attempts. Please try again in ${ATTEMPT_WINDOW / 60000} minutes.`,
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil(ATTEMPT_WINDOW / 1000)
    });
  }

  next();
};

// Clear old records periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [identifier, record] of loginAttempts.entries()) {
    if (record.blockedUntil && now > record.blockedUntil && record.attempts.length === 0) {
      loginAttempts.delete(identifier);
    }
  }
}, 60000); // Cleanup every minute

module.exports = { rateLimitLogin };
