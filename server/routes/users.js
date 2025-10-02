const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadImage, handleMulterError } = require('../middleware/upload');
const userController = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   POST /api/users/profile/image
// @desc    Upload/update profile image
// @access  Private
router.post('/profile/image', auth, uploadImage.single('image'), handleMulterError, userController.uploadProfileImage);

// @route   DELETE /api/users/profile/image
// @desc    Remove profile image
// @access  Private
router.delete('/profile/image', auth, userController.removeProfileImage);

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, userController.changePassword);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;