const express = require('express');
const router = express.Router();
const { 
  createArtwork, 
  getArtworksByUser, 
  viewArtwork, 
  likeArtwork, 
  deleteArtwork, 
  getAllArtworks,
  updateArtwork 
} = require('../controllers/artworkController');
const { getHomeFeed } = require('../controllers/artworkController');

router.get(['/feed', '/feed/:userId'], getHomeFeed);
router.post('/', createArtwork);
router.get('/user/:userId', getArtworksByUser);
router.get('/', getAllArtworks);
router.post('/:id/view', viewArtwork);
router.post('/:id/like', likeArtwork);
router.delete('/:id', deleteArtwork);
router.put('/:id', updateArtwork);

module.exports = router;