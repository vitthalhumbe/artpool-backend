const Review = require('../models/Review');
const User = require('../models/User');

const createReview = async (req, res) => {
  try {
    const { reviewerId, targetType, targetId, rating, text } = req.body;

    const existing = await Review.findOne({ reviewer: reviewerId, targetType, targetId: targetId || null });
    if (existing) return res.status(400).json({ message: "You already reviewed this." });

    const review = await Review.create({
      reviewer: reviewerId,
      targetType,
      targetId: targetId || null,
      rating,
      text
    });

    // Update artist metrics if reviewing artist
    if (targetType === 'artist' && targetId) {
      const allReviews = await Review.find({ targetType: 'artist', targetId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await User.findByIdAndUpdate(targetId, {
        'metrics.average_rating': Math.round(avg * 10) / 10,
        'metrics.total_reviews': allReviews.length
      });
    }

    const populated = await review.populate('reviewer', 'username profile.avatar_url');
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "You already reviewed this." });
    res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const query = { targetType };
    if (targetId) query.targetId = targetId;
    else query.targetId = null;

    const reviews = await Review.find(query)
      .populate('reviewer', 'username profile.avatar_url')
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.json({ reviews, average: avg, total: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews };