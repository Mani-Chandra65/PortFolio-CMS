const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadImages, handleMulterError } = require('../middleware/upload');
const projectController = require('../controllers/projectController');

// Validation middleware
const validateProject = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('shortDescription')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Short description must be less than 200 characters'),
  body('category')
    .optional()
    .isIn(['web', 'mobile', 'desktop', 'api', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['completed', 'in-progress', 'planned'])
    .withMessage('Invalid status')
];

// @route   GET /api/projects
// @desc    Get current user's projects
// @access  Private
router.get('/', auth, projectController.getProjects);

// @route   GET /api/projects/:username
// @desc    Get projects by username (public)
// @access  Public
router.get('/:username', projectController.getProjectsByUsername);

// @route   GET /api/projects/project/:id
// @desc    Get single project
// @access  Public (with optional auth)
router.get('/project/:id', optionalAuth, projectController.getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/',
  auth,
  uploadImages.array('images', 10),
  handleMulterError,
  validateProject,
  projectController.createProject
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id',
  auth,
  uploadImages.array('images', 10),
  handleMulterError,
  validateProject,
  projectController.updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;