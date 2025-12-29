const db = require('../config/database');
const Review = require('../models/mongo/Review');

class ProductService {
  async getProductsWithCache(filters = {}) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    
    // Try Redis cache first
    const cached = await db.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Query PostgreSQL
    const products = await db.prisma.product.findMany({
      where: filters,
      include: {
        store: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Cache for 5 minutes
    await db.redis.setEx(cacheKey, 300, JSON.stringify(products));
    
    return products;
  }

  async getProductDetails(productId) {
    // Get product from PostgreSQL
    const product = await db.prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: true,
        category: true
      }
    });
    
    if (!product) return null;
    
    // Get reviews from MongoDB
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get analytics
    const reviewStats = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    return {
      ...product,
      reviews,
      reviewStats: reviewStats[0] || null
    };
  }

  async createReview(productId, userId, reviewData) {
    // Check if product exists in PostgreSQL
    const product = await db.prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Create review in MongoDB
    const review = new Review({
      productId,
      userId,
      ...reviewData
    });
    
    await review.save();
    
    // Invalidate cache
    await db.redis.del(`products:${productId}:reviews`);
    
    return review;
  }
}

module.exports = new ProductService();