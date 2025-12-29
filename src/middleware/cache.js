const db = require('../config/database');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await db.redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original send function
      const originalSend = res.json;
      res.json = function(data) {
        // Cache the response
        db.redis.setEx(key, duration, JSON.stringify(data));
        originalSend.call(this, data);
      };
      
      next();
    } catch (err) {
      console.error('Cache error:', err);
      next();
    }
  };
};

module.exports = { cacheMiddleware };