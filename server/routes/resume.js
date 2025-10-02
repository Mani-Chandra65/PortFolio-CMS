const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { uploadPDFLocal, handleMulterError } = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');

// @route   POST /api/resume/upload
// @desc    Upload resume PDF
// @access  Private
router.post('/upload', 
  auth,
  uploadPDFLocal.single('resume'),
  handleMulterError,
  resumeController.uploadResume
);

// @route   GET /api/resume
// @desc    Get current user's resume
// @access  Private
router.get('/', auth, resumeController.getResume);

// @route   GET /api/resume/:username
// @desc    Get resume by username (public)
// @access  Public
router.get('/:username', resumeController.getResumeByUsername);

// @route   DELETE /api/resume
// @desc    Delete current user's resume
// @access  Private
router.delete('/', auth, resumeController.deleteResume);

module.exports = router;