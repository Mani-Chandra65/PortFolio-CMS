const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadImage, handleMulterError } = require('../middleware/upload');
const blogController = require('../controllers/blogController');

// Validation middleware
const validateBlog = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt must be less than 300 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters')
];

// @route   GET /api/blogs
// @desc    Get current user's blogs
// @access  Private
router.get('/', auth, blogController.getBlogs);

// @route   POST /api/blogs
// @desc    Create new blog post
// @access  Private
router.post('/',
  auth,
  uploadImage.single('featuredImage'),
  handleMulterError,
  validateBlog,
  blogController.createBlog
);

// @route   GET /api/blogs/post/:id
// @desc    Get single blog post by ID
// @access  Public (with optional auth)
router.get('/post/:id', optionalAuth, blogController.getBlog);

// @route   PUT /api/blogs/:id
// @desc    Update blog post
// @access  Private
router.put('/:id',
  auth,
  uploadImage.single('featuredImage'),
  handleMulterError,
  validateBlog,
  blogController.updateBlog
);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog post
// @access  Private
router.delete('/:id', auth, blogController.deleteBlog);

// @route   POST /api/blogs/:id/like
// @desc    Like/unlike blog post
// @access  Public
router.post('/:id/like', blogController.toggleLike);

// @route   GET /api/blogs/:username/:slug
// @desc    Get single blog post by username and slug (public)
// @access  Public (with optional auth for analytics)
router.get('/:username/:slug', optionalAuth, blogController.getBlogBySlug);

// @route   GET /api/blogs/:username
// @desc    Get published blogs by username (public)
// @access  Public
router.get('/:username', blogController.getBlogsByUsername);

module.exports = router;