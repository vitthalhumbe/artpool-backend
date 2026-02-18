const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateAvatar, updateProfile } = require('../controllers/authController');

router.post('/register', registerUser); 
router.post('/login', loginUser);       
router.get('/me', getMe);       
router.put('/update-avatar', updateAvatar);       
router.put('/update-profile', updateProfile);
module.exports = router;