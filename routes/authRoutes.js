const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { registerUser, loginUser, getMe, updateAvatar, updateProfile } = require('../controllers/authController');
const { toggleFollow } = require('../controllers/authController');
const { getArtists } = require('../controllers/authController');
router.get('/artists', getArtists);
const { forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
// Add this line
router.put('/users/:id/follow', toggleFollow);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getMe);
router.put('/update-avatar', updateAvatar);
router.put('/update-profile', updateProfile);


router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;