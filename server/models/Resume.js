const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  imageUrls: [{
    type: String
  }],
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  pageCount: {
    type: Number,
    default: 1
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1 });

module.exports = mongoose.model('Resume', resumeSchema);