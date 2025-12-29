const db = require('../config/database');

class AnalyticsService {
  async getSalesAnalytics(storeId, startDate, endDate) {
    // Using Prisma's raw queries for complex analytics
    const salesData = await db.prisma.$queryRaw`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(*) as total_orders,
        SUM(o.total) as revenue,
        AVG(o.total) as avg_order_value,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi.order_id
      JOIN "Product" p ON oi.product_id = p.id
      WHERE p.store_id = ${storeId}
        AND o.created_at BETWEEN ${startDate} AND ${endDate}
        AND o.status = 'COMPLETED'
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
    `;
    
    return salesData;
  }

  async getProductPerformance(storeId) {
    return await db.prisma.product.findMany({
      where: { storeId },
      include: {
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            order: {
              select: {
                total: true
              }
            }
          }
        }
      }
    });
  }

  async getUserActivity(userId, limit = 50) {
    // This would come from MongoDB activity logs
    // Implement based on your activity logging schema
  }
}

module.exports = new AnalyticsService();