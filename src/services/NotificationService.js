const mongoose = require('mongoose');
const db = require('../config/database');

const notificationSchema = new mongoose.Schema({
  userId: Number,
  type: String,
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 604800 } // Auto-delete after 7 days
});

const Notification = mongoose.model('Notification', notificationSchema);

class NotificationService {
  async sendNotification(userId, type, data) {
    const notification = new Notification({
      userId,
      type,
      ...data
    });
    
    await notification.save();
    
    // Publish to Redis for real-time updates
    await db.redis.publish(
      `notifications:${userId}`,
      JSON.stringify(notification.toObject())
    );
    
    return notification;
  }

  async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new NotificationService();