const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true }, // References PostgreSQL product.id
  userId: { type: Number, required: true },    // References PostgreSQL user.id
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  images: [String],
  helpfulCount: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  metadata: mongoose.Schema.Types.Mixed, // Flexible field
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fast lookups
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);