const express = require('express');
const path = require('path');
require('dotenv').config();

// Import server configuration
const { connectDB } = require('./server/config/database');
const { setupMiddleware } = require('./server/config/middleware');

const app = express();

// Connect to MongoDB
connectDB();

// Setup middleware
setupMiddleware(app);

// Static files
app.use(express.static(path.join(__dirname, 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/users', require('./server/routes/users'));
app.use('/api/portfolio', require('./server/routes/portfolio'));
app.use('/api/resume', require('./server/routes/resume'));
app.use('/api/projects', require('./server/routes/projects'));
app.use('/api/blogs', require('./server/routes/blogs'));
app.use('/api/admin', require('./server/routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'unknown',
    mongo: !!process.env.MONGODB_URI,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// Serve client application for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access the app at: http://localhost:${PORT}`);
});