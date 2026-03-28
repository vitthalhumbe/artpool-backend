const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'customer',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), 
      });
    } else {
      res.status(400).json({ message: 'invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password'); 
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};
const updateAvatar = async (req, res) => {
  try {
    const { avatar_url, userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId, 
      { "profile.avatar_url": avatar_url },
      { new: true } 
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, username, bio, location, banner_url, avatar_url } = req.body;
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (bio) fieldsToUpdate['profile.bio'] = bio;
    if (location) fieldsToUpdate['profile.location'] = location;
    if (banner_url) fieldsToUpdate['profile.banner_url'] = banner_url;
    if (avatar_url) fieldsToUpdate['profile.avatar_url'] = avatar_url;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: fieldsToUpdate },
      { returnDocument: 'after', runValidators: true }
    ).select('-password'); 

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id; // The profile being viewed
    const currentUserId = req.body.userId; // The logged-in user clicking the button

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // UNFOLLOW LOGIC
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      res.status(200).json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // FOLLOW LOGIC
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
      res.status(200).json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateAvatar,
  updateProfile,
  toggleFollow
};