const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }], 
  
  artist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  category: { type: String, default: 'Painting' },
  tags: [{ type: String }], 
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likes_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
},
  
  createdAt: { type: Date, default: Date.now },
  sold: { type: Boolean, default: false },
});

module.exports = mongoose.model('Artwork', ArtworkSchema);