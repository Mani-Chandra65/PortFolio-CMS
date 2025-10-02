const User = require('../models/User');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Resume = require('../models/Resume');

// @desc    Get complete portfolio by username
// @route   GET /api/portfolio/:username
// @access  Public
const getPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Get user's projects (featured first, then by order)
    const projects = await Project.find({ 
      userId: user._id, 
      status: 'completed' 
    })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(6);

    // Get user's recent blog posts
    const blogs = await Blog.find({ 
      userId: user._id, 
      status: 'published' 
    })
    .sort({ featured: -1, publishedAt: -1 })
    .limit(3)
    .select('-content'); // Exclude full content for overview

    // Get user's resume
    const resume = await Resume.findOne({ userId: user._id });

    res.json({
      portfolio: {
        user: {
          id: user._id,
          username: user.username,
          profile: user.profile,
          createdAt: user.createdAt
        },
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
          createdAt: project.createdAt
        })),
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
        resume: resume ? {
          id: resume._id,
          originalFileName: resume.originalFileName,
          originalUrl: resume.pdfUrl, // Match frontend expectation
          pdfUrl: resume.pdfUrl,
          images: resume.imageUrls, // Match frontend expectation
          imageUrls: resume.imageUrls,
          pageCount: resume.pageCount,
          uploadedAt: resume.uploadedAt
        } : null,
        stats: {
          totalProjects: await Project.countDocuments({ userId: user._id, status: 'completed' }),
          totalBlogs: await Blog.countDocuments({ userId: user._id, status: 'published' }),
          totalViews: await Blog.aggregate([
            { $match: { userId: user._id, status: 'published' } },
            { $group: { _id: null, total: { $sum: '$views' } } }
          ]).then(result => result[0]?.total || 0)
        }
      }
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get portfolio statistics
// @route   GET /api/portfolio/:username/stats
// @access  Public
const getPortfolioStats = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const stats = {
      projects: await Project.countDocuments({ userId: user._id, status: 'completed' }),
      blogs: await Blog.countDocuments({ userId: user._id, status: 'published' }),
      totalViews: await Blog.aggregate([
        { $match: { userId: user._id, status: 'published' } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]).then(result => result[0]?.total || 0),
      totalLikes: await Blog.aggregate([
        { $match: { userId: user._id, status: 'published' } },
        { $group: { _id: null, total: { $sum: '$likes' } } }
      ]).then(result => result[0]?.total || 0),
      joinedDate: user.createdAt
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get portfolio stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile (same as userController but for portfolio context)
// @route   PUT /api/portfolio/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      title,
      bio,
      location,
      phone,
      website,
      socialLinks
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      title: title || user.profile.title,
      bio: bio || user.profile.bio,
      location: location || user.profile.location,
      phone: phone || user.profile.phone,
      website: website || user.profile.website,
      socialLinks: socialLinks ? { ...user.profile.socialLinks, ...socialLinks } : user.profile.socialLinks
    };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPortfolio,
  getPortfolioStats,
  updateProfile
};