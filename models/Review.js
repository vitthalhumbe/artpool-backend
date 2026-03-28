const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['artwork', 'artist', 'website'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

// One review per user per target
reviewSchema.index({ reviewer: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);