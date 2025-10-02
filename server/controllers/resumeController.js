const { validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const { convertPdfToImages, deletePdfImages } = require('../utils/pdfConverter');

// @desc    Upload resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    console.log('Resume upload started');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);
    const userId = req.user.id;
    
    // Check if user already has a resume and delete it
    console.log('Checking for existing resume...');
    const existingResume = await Resume.findOne({ userId });
  if (existingResume) {
      console.log('Deleting existing resume...');
      // Delete old images from Cloudinary
      if (existingResume.imageUrls && existingResume.imageUrls.length > 0) {
        await deletePdfImages(existingResume.imageUrls);
      }
      
      // Delete old PDF from Cloudinary
      const publicId = existingResume.cloudinaryPublicId;
      // Attempt to delete with raw resource type first (current upload mode), then fallback to image
      const cloudinary = require('../config/cloudinary');
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (e) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {});
      }
      
      // Remove from database
      await Resume.findByIdAndDelete(existingResume._id);
    }

    // Convert PDF to images (using local file path) with timeout
    console.log('Starting PDF conversion...');
    const conversionPromise = convertPdfToImages(req.file.path);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF conversion timeout')), 30000); // 30 second timeout
    });
    
    const { imageUrls, pageCount } = await Promise.race([conversionPromise, timeoutPromise]);
    console.log('PDF conversion completed. Pages:', pageCount);

    // Upload PDF to Cloudinary (raw resource, explicit public access)
    console.log('Uploading PDF to Cloudinary...');
    const pdfResult = await require('../config/cloudinary').uploader.upload(req.file.path, {
      folder: 'portfolio-cms/resumes',
      resource_type: 'raw',
      access_mode: 'public',
      type: 'upload',
      public_id: `resume_${userId}_${Date.now()}` // Unique identifier
    });
    console.log('PDF uploaded to Cloudinary');

    // Clean up local PDF file
    console.log('Cleaning up local file...');
    const fs = require('fs').promises;
    await fs.unlink(req.file.path).catch(() => {});

    // Create new resume record
    console.log('Saving resume to database...');
    const resume = new Resume({
      userId,
      originalFileName: req.file.originalname,
      pdfUrl: pdfResult.secure_url,
      imageUrls,
      cloudinaryPublicId: pdfResult.public_id,
      fileSize: req.file.size,
      pageCount
    });

    await resume.save();
    console.log('Resume saved successfully');

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        originalName: resume.originalFileName,
        originalFileName: resume.originalFileName,
        originalUrl: resume.pdfUrl,
        pdfUrl: resume.pdfUrl,
        images: resume.imageUrls,
        imageUrls: resume.imageUrls,
        pageCount: resume.pageCount,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        updatedAt: resume.updatedAt
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up local file on error
    if (req.file && req.file.path) {
      const fs = require('fs').promises;
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    let errorMessage = 'Error uploading resume';
    if (error.message === 'PDF conversion timeout') {
      errorMessage = 'PDF processing timeout. Please try with a smaller file.';
    } else if (error.message.includes('pdf-poppler')) {
      errorMessage = 'PDF processing failed. Please ensure the file is a valid PDF.';
    }
    
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Get user's resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const resume = await Resume.findOne({ userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({
      resume: {
        id: resume._id,
        originalName: resume.originalFileName,
        originalFileName: resume.originalFileName,
        originalUrl: resume.pdfUrl,
        pdfUrl: resume.pdfUrl,
        images: resume.imageUrls,
        imageUrls: resume.imageUrls,
        pageCount: resume.pageCount,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        updatedAt: resume.updatedAt
      }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
};

// @desc    Get resume by username (public)
// @route   GET /api/resume/:username
// @access  Public
const getResumeByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const User = require('../models/User');
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resume = await Resume.findOne({ userId: user._id });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found for this user' });
    }

    res.json({
      resume: {
        id: resume._id,
        originalName: resume.originalFileName,
        originalFileName: resume.originalFileName,
        originalUrl: resume.pdfUrl,
        pdfUrl: resume.pdfUrl,
        images: resume.imageUrls,
        imageUrls: resume.imageUrls,
        pageCount: resume.pageCount,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt
      },
      user: {
        username: user.username,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Get resume by username error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const resume = await Resume.findOne({ userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    // Delete images from Cloudinary
    if (resume.imageUrls && resume.imageUrls.length > 0) {
      await deletePdfImages(resume.imageUrls);
    }

    // Delete PDF from Cloudinary
    const publicId = resume.cloudinaryPublicId;
    // Attempt to delete with raw resource type first (current upload mode), then fallback to image
    const cloudinary = require('../config/cloudinary');
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (e) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {});
    }

    // Delete from database
    await Resume.findByIdAndDelete(resume._id);

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
};

module.exports = {
  uploadResume,
  getResume,
  getResumeByUsername,
  deleteResume
};