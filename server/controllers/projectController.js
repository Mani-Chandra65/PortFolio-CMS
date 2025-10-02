const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, status, featured } = req.query;
    
    let filter = { userId };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';

    const projects = await Project.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .populate('userId', 'username profile.firstName profile.lastName');

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        technologies: project.technologies,
        images: project.images,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        category: project.category,
        status: project.status,
        featured: project.featured,
        startDate: project.startDate,
        endDate: project.endDate,
        order: project.order,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// @desc    Get projects by username (public)
// @route   GET /api/projects/:username
// @access  Public
const getProjectsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { category, featured, limit } = req.query;
    
    // Find user by username
    const User = require('../models/User');
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = { userId: user._id, status: 'completed' };
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    let query = Project.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 });
      
    if (limit) query = query.limit(parseInt(limit));

    const projects = await query.exec();

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        technologies: project.technologies,
        images: project.images,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        category: project.category,
        featured: project.featured,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt
      })),
      user: {
        username: user.username,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Get projects by username error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/project/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('userId', 'username profile.firstName profile.lastName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project or if project is completed (public)
    if (project.status !== 'completed' && 
        (!req.user || project.userId._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        technologies: project.technologies,
        images: project.images,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        category: project.category,
        status: project.status,
        featured: project.featured,
        startDate: project.startDate,
        endDate: project.endDate,
        order: project.order,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      user: {
        username: project.userId.username,
        profile: project.userId.profile
      }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
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
      description,
      shortDescription,
      technologies,
      demoUrl,
      githubUrl,
      category,
      status,
      featured,
      startDate,
      endDate,
      order
    } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        caption: '',
        cloudinaryPublicId: file.filename
      }));
    }

    const project = new Project({
      userId,
      title,
      description,
      shortDescription,
      technologies: Array.isArray(technologies) ? technologies : technologies?.split(',').map(t => t.trim()),
      images,
      demoUrl,
      githubUrl,
      category,
      status,
      featured: featured === 'true' || featured === true,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      order: order ? parseInt(order) : 0
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        technologies: project.technologies,
        images: project.images,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        category: project.category,
        status: project.status,
        featured: project.featured,
        startDate: project.startDate,
        endDate: project.endDate,
        order: project.order,
        createdAt: project.createdAt
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: id, userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
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
      description,
      shortDescription,
      technologies,
      demoUrl,
      githubUrl,
      category,
      status,
      featured,
      startDate,
      endDate,
      order
    } = req.body;

    // Handle new uploaded images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => ({
        url: file.path,
        caption: '',
        cloudinaryPublicId: file.filename
      }));
    }

    // Update project fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.shortDescription = shortDescription || project.shortDescription;
    project.technologies = technologies ? 
      (Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim())) :
      project.technologies;
    project.demoUrl = demoUrl || project.demoUrl;
    project.githubUrl = githubUrl || project.githubUrl;
    project.category = category || project.category;
    project.status = status || project.status;
    project.featured = featured !== undefined ? (featured === 'true' || featured === true) : project.featured;
    project.startDate = startDate ? new Date(startDate) : project.startDate;
    project.endDate = endDate ? new Date(endDate) : project.endDate;
    project.order = order !== undefined ? parseInt(order) : project.order;

    // Add new images to existing ones
    if (newImages.length > 0) {
      project.images = [...project.images, ...newImages];
    }

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        shortDescription: project.shortDescription,
        technologies: project.technologies,
        images: project.images,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        category: project.category,
        status: project.status,
        featured: project.featured,
        startDate: project.startDate,
        endDate: project.endDate,
        order: project.order,
        updatedAt: project.updatedAt
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: id, userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete images from Cloudinary
    if (project.images && project.images.length > 0) {
      const deletePromises = project.images.map(image => {
        if (image.cloudinaryPublicId) {
          return cloudinary.uploader.destroy(image.cloudinaryPublicId);
        }
      });
      await Promise.all(deletePromises);
    }

    await Project.findByIdAndDelete(id);

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

module.exports = {
  getProjects,
  getProjectsByUsername,
  getProject,
  createProject,
  updateProject,
  deleteProject
};