// backend/models/Commission.js
const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referenceImages: [{
    type: String // We will store custom image URLs here
  }],
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);