const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

// @route   GET /api/portfolio/:username
// @desc    Get complete portfolio by username (public)
// @access  Public
router.get('/:username', portfolioController.getPortfolio);

// @route   GET /api/portfolio/:username/stats
// @desc    Get portfolio statistics (public)
// @access  Public
router.get('/:username/stats', portfolioController.getPortfolioStats);

// @route   PUT /api/portfolio/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, portfolioController.updateProfile);

module.exports = router;