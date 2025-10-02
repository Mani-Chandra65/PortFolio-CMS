const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

// @desc    Get all blogs for a user
// @route   GET /api/blogs
// @access  Private
const getBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, limit, page = 1 } = req.query;
    
    let filter = { userId };
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const pageSize = parseInt(limit) || 10;
    const skip = (parseInt(page) - 1) * pageSize;

    const blogs = await Blog.find(filter)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('userId', 'username profile.firstName profile.lastName');

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs: blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        status: blog.status,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        views: blog.views,
        likes: blog.likes,
        featured: blog.featured,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / pageSize),
        total
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

// @desc    Get published blogs by username (public)
// @route   GET /api/blogs/:username
// @access  Public
const getBlogsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { category, tag, limit, page = 1 } = req.query;
    
    // Find user by username
    const User = require('../models/User');
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = { userId: user._id, status: 'published' };
    
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const pageSize = parseInt(limit) || 10;
    const skip = (parseInt(page) - 1) * pageSize;

    const blogs = await Blog.find(filter)
      .sort({ featured: -1, publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-content'); // Exclude full content for list view

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs: blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        views: blog.views,
        likes: blog.likes,
        featured: blog.featured
      })),
      user: {
        username: user.username,
        profile: user.profile
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / pageSize),
        total
      }
    });

  } catch (error) {
    console.error('Get blogs by username error:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/post/:id
// @access  Public
const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id)
      .populate('userId', 'username profile.firstName profile.lastName');

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user owns the blog or if blog is published
    if (blog.status !== 'published' && 
        (!req.user || blog.userId._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment views if not the owner
    if (!req.user || blog.userId._id.toString() !== req.user.id) {
      blog.views += 1;
      await blog.save();
    }

    res.json({
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        status: blog.status,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        views: blog.views,
        likes: blog.likes,
        featured: blog.featured,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      },
      user: {
        username: blog.userId.username,
        profile: blog.userId.profile
      }
    });

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
};

// @desc    Get blog by username and slug
// @route   GET /api/blogs/:username/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const { username, slug } = req.params;
    
    // Find user by username
    const User = require('../models/User');
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const blog = await Blog.findOne({ 
      userId: user._id, 
      slug,
      status: 'published'
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment views if not the owner
    if (!req.user || blog.userId.toString() !== req.user.id) {
      blog.views += 1;
      await blog.save();
    }

    res.json({
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        views: blog.views,
        likes: blog.likes,
        featured: blog.featured
      },
      user: {
        username: user.username,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const userId = req.user.id;
    const {
      title,
      excerpt,
      content,
      tags,
      category,
      status,
      featured
    } = req.body;

    // Handle featured image upload
    let featuredImage = null;
    if (req.file) {
      featuredImage = {
        url: req.file.path,
        caption: '',
        cloudinaryPublicId: req.file.filename
      };
    }

    // Generate slug manually if pre-save hook fails
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const blog = new Blog({
      userId,
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim().toLowerCase()) : []),
      category: category || 'general',
      status: status || 'draft',
      featured: featured === 'true' || featured === true,
      publishedAt: status === 'published' ? new Date() : undefined
    });

    await blog.save();

    res.status(201).json({
      message: 'Blog post created successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        status: blog.status,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        featured: blog.featured,
        createdAt: blog.createdAt
      }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Error creating blog post' });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findOne({ _id: id, userId });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      excerpt,
      content,
      tags,
      category,
      status,
      featured
    } = req.body;

    // Handle new featured image
    if (req.file) {
      // Delete old featured image if exists
      if (blog.featuredImage && blog.featuredImage.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(blog.featuredImage.cloudinaryPublicId);
      }
      
      blog.featuredImage = {
        url: req.file.path,
        caption: '',
        cloudinaryPublicId: req.file.filename
      };
    }

    // Update fields
    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.tags = tags ? 
      (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase())) :
      blog.tags;
    blog.category = category || blog.category;
    blog.featured = featured !== undefined ? (featured === 'true' || featured === true) : blog.featured;

    // Handle status change to published
    if (status && status !== blog.status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();

    res.json({
      message: 'Blog post updated successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        tags: blog.tags,
        category: blog.category,
        status: blog.status,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        featured: blog.featured,
        updatedAt: blog.updatedAt
      }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Error updating blog post' });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findOne({ _id: id, userId });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Delete featured image from Cloudinary
    if (blog.featuredImage && blog.featuredImage.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(blog.featuredImage.cloudinaryPublicId);
    }

    await Blog.findByIdAndDelete(id);

    res.json({ message: 'Blog post deleted successfully' });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Error deleting blog post' });
  }
};

// @desc    Toggle like on blog post
// @route   POST /api/blogs/:id/like
// @access  Public
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Simple like increment (in a real app, you'd track user likes)
    blog.likes += 1;
    await blog.save();

    res.json({ 
      message: 'Blog liked successfully',
      likes: blog.likes 
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Error liking blog post' });
  }
};

module.exports = {
  getBlogs,
  getBlogsByUsername,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike
};