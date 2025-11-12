/**
 * Rate Limiting Middleware
 * Implements in-memory rate limiting for API endpoints
 */

// In-memory storage for rate limiting
const requestCounts = new Map();
const CLEANUP_INTERVAL = 60000; // Clean up old entries every minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.window) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // Strict limit for email sending
  EMAIL: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many emails sent. Please try again later.'
  },

  // Medium limit for general API calls
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests. Please slow down.'
  },

  // Relaxed limit for read operations
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please wait a moment.'
  },

  // Very strict for expensive operations
  EXPENSIVE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Operation limit reached. Please try again later.'
  }
};

/**
 * Create rate limiter middleware
 * @param {Object} config - Rate limit configuration
 * @param {number} config.windowMs - Time window in milliseconds
 * @param {number} config.maxRequests - Maximum requests per window
 * @param {string} config.message - Error message when limit exceeded
 * @param {Function} config.keyGenerator - Optional function to generate rate limit key (default: IP address)
 */
export function createRateLimiter(config) {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests',
    keyGenerator = null
  } = config;

  return async (req, res, handler) => {
    // Generate rate limit key (default: IP address)
    const key = keyGenerator
      ? keyGenerator(req)
      : getIpAddress(req);

    const now = Date.now();
    const rateLimitKey = `${key}`;

    // Get or create rate limit data
    let rateLimitData = requestCounts.get(rateLimitKey);

    if (!rateLimitData || now - rateLimitData.resetTime > windowMs) {
      // Reset the counter
      rateLimitData = {
        count: 0,
        resetTime: now,
        window: windowMs
      };
    }

    // Increment counter
    rateLimitData.count++;
    requestCounts.set(rateLimitKey, rateLimitData);

    // Check if limit exceeded
    if (rateLimitData.count > maxRequests) {
      const retryAfter = Math.ceil((windowMs - (now - rateLimitData.resetTime)) / 1000);

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime + windowMs).toISOString());
      res.setHeader('Retry-After', retryAfter.toString());

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: retryAfter
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - rateLimitData.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime + windowMs).toISOString());

    // Continue to handler
    return handler(req, res);
  };
}

/**
 * Helper to get client IP address
 */
function getIpAddress(req) {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Create user-based rate limiter (requires authentication)
 */
export function createUserRateLimiter(config) {
  return createRateLimiter({
    ...config,
    keyGenerator: (req) => {
      // Rate limit per user ID (requires req.user to be set by auth middleware)
      return req.user?.id || getIpAddress(req);
    }
  });
}

/**
 * Wrapper for easy rate limiting + authentication
 */
export function withRateLimit(preset = RateLimitPresets.API) {
  return (handler) => {
    const limiter = createRateLimiter(preset);
    return (req, res) => limiter(req, res, handler);
  };
}
