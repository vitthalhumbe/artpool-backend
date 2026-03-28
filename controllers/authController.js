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
const getArtists = async (req, res) => {
  try {
    const search = req.query.search || '';
    const sort = req.query.sort || 'followers';

    const query = { role: 'artist' };
    if (search) query.username = { $regex: search, $options: 'i' };

    let artists = await User.find(query).select('-password');

    if (sort === 'followers') {
      artists.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
    } else if (sort === 'rating') {
      artists.sort((a, b) => (b.metrics?.average_rating || 0) - (a.metrics?.average_rating || 0));
    }

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No account with that email." });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await User.findByIdAndUpdate(user._id, {
  resetPasswordToken: token,
  resetPasswordExpire: Date.now() + 15 * 60 * 1000
});

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"ArtPool" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'ArtPool Password Reset',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
          <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset link." });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { registerUser, loginUser, getMe, updateAvatar, updateProfile, toggleFollow, getArtists, forgotPassword, resetPassword };