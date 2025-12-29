const db = require('../config/database');

const rateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    
    try {
      const current = await db.redis.get(key);
      
      if (current === null) {
        await db.redis.setEx(key, windowMs / 1000, '1');
        return next();
      }
      
      const requests = parseInt(current);
      
      if (requests >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: windowMs / 1000
        });
      }
      
      await db.redis.incr(key);
      next();
    } catch (err) {
      console.error('Rate limit error:', err);
      next();
    }
  };
};

module.exports = { rateLimiter };