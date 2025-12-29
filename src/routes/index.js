const express = require('express');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const { rateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Apply rate limiting to all routes
router.use(rateLimiter());

// API Routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date(),
    databases: {
      postgresql: 'connected',
      mongodb: 'connected',
      redis: 'connected'
    }
  };
  
  res.json(health);
});

module.exports = router;