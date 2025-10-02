const User = require('../models/User');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Resume = require('../models/Resume');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / pageSize),
        total
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const stats = {
      projects: await Project.countDocuments({ userId: id }),
      blogs: await Blog.countDocuments({ userId: id }),
      hasResume: !!(await Resume.findOne({ userId: id }))
    };

    res.json({
      user,
      stats
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's data
    await Resume.findOneAndDelete({ userId: id });
    await Project.deleteMany({ userId: id });
    await Blog.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        inactive: await User.countDocuments({ isActive: false }),
        admins: await User.countDocuments({ role: 'admin' })
      },
      content: {
        projects: await Project.countDocuments(),
        blogs: await Blog.countDocuments(),
        publishedBlogs: await Blog.countDocuments({ status: 'published' }),
        resumes: await Resume.countDocuments()
      },
      engagement: {
        totalViews: await Blog.aggregate([
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]).then(result => result[0]?.total || 0),
        totalLikes: await Blog.aggregate([
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    stats.recent = {
      newUsers: await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newProjects: await Project.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newBlogs: await Blog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Admin
const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    const projects = await Project.find(filter)
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / pageSize),
        total
      }
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all blog posts
// @route   GET /api/admin/blogs
// @access  Admin
const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    const blogs = await Blog.find(filter)
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-content'); // Exclude content for list view

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / pageSize),
        total
      }
    });

  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getStats,
  getAllProjects,
  getAllBlogs
};