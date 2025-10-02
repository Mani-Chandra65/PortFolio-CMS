const { validationResult } = require('express-validator');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      email,
      username,
      firstName,
      lastName,
      title,
      bio,
      location,
      phone,
      website,
      socialLinks
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email provided and changed, ensure it's unique
    if (email && email !== user.email) {
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    // If username provided and changed, ensure it's unique and normalize
    if (username && username !== user.username) {
      const normalized = String(username).trim();
      const existingByUsername = await User.findOne({ username: normalized });
      if (existingByUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = normalized;
    }

    // Ensure profile object exists
    if (!user.profile) user.profile = {};
    if (!user.profile.socialLinks || typeof user.profile.socialLinks !== 'object') {
      user.profile.socialLinks = {};
    }

    // Update profile fields directly to avoid accidentally overwriting nested objects
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (title !== undefined) user.profile.title = title;
    if (bio !== undefined) user.profile.bio = bio;
    if (location !== undefined) user.profile.location = location;
    if (phone !== undefined) user.profile.phone = phone;
    if (website !== undefined) user.profile.website = website;
    if (socialLinks && typeof socialLinks === 'object') {
      user.profile.socialLinks = { ...user.profile.socialLinks, ...socialLinks };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user's resume
    await Resume.findOneAndDelete({ userId });

    // Delete user's projects
    await Project.deleteMany({ userId });

    // Delete user's blogs
    await Blog.deleteMany({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  uploadProfileImage: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      // Basic config sanity check to avoid opaque 500s
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ message: 'Image service not configured. Missing Cloudinary environment variables.' });
      }

      // Ensure profile and socialLinks exist
      if (!user.profile) user.profile = {};
      if (!user.profile.socialLinks || typeof user.profile.socialLinks !== 'object') {
        user.profile.socialLinks = {};
      }

      // Delete previous image if stored with Cloudinary
      const prevPublicId = user.profile.profileImagePublicId;
      if (prevPublicId) {
        try { await cloudinary.uploader.destroy(prevPublicId); } catch (e) {}
      }

      // Save new image directly on nested fields
      user.profile.profileImage = req.file.path;
      user.profile.profileImagePublicId = req.file.filename;
      await user.save();

      res.json({
        message: 'Profile image updated',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Upload profile image error:', error && (error.stack || error.message || error));
      res.status(500).json({ message: 'Failed to upload profile image' });
    }
  },
  removeProfileImage: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!user.profile) user.profile = {};
      if (!user.profile.socialLinks || typeof user.profile.socialLinks !== 'object') {
        user.profile.socialLinks = {};
      }

      const prevPublicId = user.profile.profileImagePublicId;
      if (prevPublicId) {
        try { await cloudinary.uploader.destroy(prevPublicId); } catch (e) {}
      }

      user.profile.profileImage = undefined;
      user.profile.profileImagePublicId = undefined;
      await user.save();

      res.json({
        message: 'Profile image removed',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Remove profile image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};