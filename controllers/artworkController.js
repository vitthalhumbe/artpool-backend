const Artwork = require('../models/Artwork');
const User = require('../models/User'); // Make sure to import the User model at the top!

// @desc    Get Home Feed (Followed Artists OR Top Liked)
// @route   GET /api/artworks/feed/:userId?
// @access  Public (Guest) or Private (Logged In)
const getHomeFeed = async (req, res) => {
  try {
    const userId = req.params.userId;
    let artworks = [];

    // 1. IF LOGGED IN: Try to get artworks from followed artists
    if (userId && userId !== 'undefined') {
      const currentUser = await User.findById(userId);
      
      if (currentUser && currentUser.following.length > 0) {
        artworks = await Artwork.find({ artist: { $in: currentUser.following } })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate('artist', 'username profile.avatar_url');
      }
    }

    // 2. FALLBACK: If not logged in, OR user follows nobody, OR followed artists have 0 art
    if (artworks.length === 0) {
      artworks = await Artwork.find()
        .sort({ 'stats.likes': -1, views: -1 }) // Sort by highest likes/views
        .limit(20)
        .populate('artist', 'username profile.avatar_url');
    }

    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createArtwork = async (req, res) => {
  try {
    const { title, description, price, images, artist, category, tags } = req.body;

    const artwork = await Artwork.create({
      title,
      description,
      price,
      artist,
      images: images || [],
      
      category: category || 'Painting', 
      tags: tags || [], 
      
      stats: { views: 0, likes: 0 }
    });

    res.status(201).json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getArtworksByUser = async (req, res) => {
  try {
   const artworks = await Artwork.find({ artist: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('artist', 'username profile.avatar_url');
      return res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const viewArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { "stats.views": 1 } },
      { new: true }
    );
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const likeArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    const userId = req.body.userId; 
    if (artwork.stats.likes_users && artwork.stats.likes_users.includes(userId)) {
      artwork.stats.likes_users.pull(userId);
      artwork.stats.likes--;
    } else {
      if (!artwork.stats.likes_users) artwork.stats.likes_users = [];
      
      artwork.stats.likes_users.push(userId);
      artwork.stats.likes++;
    }

    await artwork.save();
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteArtwork = async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: "Artwork deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateArtwork = async (req, res) => {
  try {
    const { title, description, price, category, tags } = req.body;
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { title, description, price, category, tags },
      { new: true }
    );
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllArtworks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;

    const total = await Artwork.countDocuments(query);
    const artworks = await Artwork.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('artist', 'username profile.avatar_url');

    res.status(200).json({
      artworks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createArtwork, getArtworksByUser, getAllArtworks, viewArtwork, likeArtwork, deleteArtwork,updateArtwork, getHomeFeed };