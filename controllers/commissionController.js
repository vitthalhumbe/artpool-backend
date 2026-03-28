// backend/controllers/commissionController.js
const Commission = require('../models/Commission');

// @desc    Create a new commission request
// @route   POST /api/commissions
// @access  Private
const createCommission = async (req, res) => {
  try {
    const { artistId, buyerId, description, budget, deadline, referenceImages } = req.body;

    if (artistId === buyerId) {
      return res.status(400).json({ message: "You cannot commission yourself!" });
    }

    const newCommission = await Commission.create({
      buyer: buyerId,
      artist: artistId,
      referenceImages: referenceImages || [],
      description,
      budget,
      deadline
    });

    res.status(201).json(newCommission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get commissions for a user (either as buyer or artist)
// @route   GET /api/commissions/user/:userId
// @access  Private
const getUserCommissions = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find commissions where the user is EITHER the artist OR the buyer
    const commissions = await Commission.find({
      $or: [{ artist: userId }, { buyer: userId }]
    })
    .populate('artist', 'username profile.avatar_url')
    .populate('buyer', 'username profile.avatar_url')
    .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(commissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update commission status (Accept/Decline/Complete)
// @route   PUT /api/commissions/:id/status
// @access  Private
const updateCommissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure it's a valid status
    if (!['pending', 'accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedCommission = await Commission.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    )
    .populate('artist', 'username profile.avatar_url')
    .populate('buyer', 'username profile.avatar_url');

    if (!updatedCommission) return res.status(404).json({ message: "Commission not found" });

    res.status(200).json(updatedCommission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update your exports at the bottom!
module.exports = { createCommission, getUserCommissions, updateCommissionStatus };