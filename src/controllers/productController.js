const productService = require('../services/ProductService');
const { cacheMiddleware } = require('../middleware/cache');

const productController = {
  // GET /api/products - with caching
  getAllProducts: [cacheMiddleware(300), async (req, res) => {
    try {
      const { category, minPrice, maxPrice, storeId } = req.query;
      const filters = {};
      
      if (category) filters.categoryId = parseInt(category);
      if (storeId) filters.storeId = parseInt(storeId);
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.gte = parseFloat(minPrice);
        if (maxPrice) filters.price.lte = parseFloat(maxPrice);
      }
      
      const products = await productService.getProductsWithCache(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }],

  // GET /api/products/:id
  getProduct: async (req, res) => {
    try {
      const product = await productService.getProductDetails(
        parseInt(req.params.id)
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/products/:id/reviews
  createReview: async (req, res) => {
    try {
      const { rating, title, comment } = req.body;
      
      const review = await productService.createReview(
        parseInt(req.params.id),
        req.user.id, // Assuming authentication middleware
        { rating, title, comment }
      );
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = productController;