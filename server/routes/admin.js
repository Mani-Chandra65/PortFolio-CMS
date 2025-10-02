const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply auth and adminAuth to all admin routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', adminController.getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin
router.get('/users/:id', adminController.getUserById);

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Admin
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Admin
router.delete('/users/:id', adminController.deleteUser);

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', adminController.getStats);

// @route   GET /api/admin/projects
// @desc    Get all projects
// @access  Admin
router.get('/projects', adminController.getAllProjects);

// @route   GET /api/admin/blogs
// @desc    Get all blog posts
// @access  Admin
router.get('/blogs', adminController.getAllBlogs);

module.exports = router;