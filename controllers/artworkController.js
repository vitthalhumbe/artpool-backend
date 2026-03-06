const Artwork = require('../models/Artwork');

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
    const artworks = await Artwork.find()
      .sort({ createdAt: -1 }) 
      .populate('artist', 'username profile.avatar_url');
    
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createArtwork, getArtworksByUser, getAllArtworks, viewArtwork, likeArtwork, deleteArtwork,updateArtwork };