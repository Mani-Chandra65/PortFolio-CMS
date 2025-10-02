// Placeholder controllers for remaining functionality
angular.module('portfolioApp')

.controller('ResumeController', ['$scope', 'ResumeService', 'AlertService', 'UPLOAD_LIMITS',
function($scope, ResumeService, AlertService, UPLOAD_LIMITS) {
    $scope.resume = null;
    $scope.uploading = false;
    $scope.selectedFile = null;
    
    // Load existing resume
    function loadResume() {
        ResumeService.get()
            .then(function(response) {
                $scope.resume = response.resume;
            })
            .catch(function(error) {
                // No resume exists yet
            });
    }
    
    // File selection
    $scope.onFileSelect = function(file) {
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            AlertService.error('Invalid File', 'Please select a PDF file.');
            return;
        }
        
        if (file.size > UPLOAD_LIMITS.PDF_SIZE) {
            AlertService.error('File Too Large', 'PDF file must be less than 10MB.');
            return;
        }
        
        $scope.selectedFile = file;
    };
    
    // Upload resume
    $scope.uploadResume = function() {
        if (!$scope.selectedFile) {
            AlertService.error('No File Selected', 'Please select a PDF file to upload.');
            return;
        }
        
        $scope.uploading = true;
        
        ResumeService.upload($scope.selectedFile)
            .then(function(response) {
                $scope.resume = response.resume;
                $scope.selectedFile = null;
                AlertService.success('Success', 'Resume uploaded successfully!');
            })
            .catch(function(error) {
                AlertService.error('Upload Failed', error.message || 'Failed to upload resume.');
            })
            .finally(function() {
                $scope.uploading = false;
            });
    };
    
    // Delete resume
    $scope.deleteResume = function() {
        if (!confirm('Are you sure you want to delete your resume?')) {
            return;
        }
        
        ResumeService.delete()
            .then(function() {
                $scope.resume = null;
                AlertService.success('Deleted', 'Resume deleted successfully.');
            })
            .catch(function(error) {
                AlertService.error('Delete Failed', error.message || 'Failed to delete resume.');
            });
    };
    
    loadResume();
}])

.controller('ProjectController', ['$scope', '$routeParams', '$location', 'ProjectService', 'AlertService',
function($scope, $routeParams, $location, ProjectService, AlertService) {
    $scope.projects = [];
    $scope.project = {};
    $scope.isEditing = false;
    $scope.loading = false;
    
    // Initialize
    function init() {
        if ($routeParams.id) {
            $scope.isEditing = true;
            loadProject($routeParams.id);
        } else if ($location.path().includes('/new')) {
            $scope.project = {
                title: '',
                description: '',
                shortDescription: '',
                technologies: [],
                category: 'web',
                status: 'completed',
                featured: false
            };
        } else {
            loadProjects();
        }
    }
    
    // Load projects
    function loadProjects() {
        $scope.loading = true;
        
        ProjectService.getAll()
            .then(function(response) {
                $scope.projects = response.projects || [];
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to load projects.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Load single project
    function loadProject(id) {
        $scope.loading = true;
        
        ProjectService.get(id)
            .then(function(response) {
                $scope.project = response.project;
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to load project.');
                $location.path('/projects');
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Save project
    $scope.saveProject = function() {
        $scope.loading = true;
        
        const operation = $scope.isEditing 
            ? ProjectService.update($scope.project.id, $scope.project)
            : ProjectService.create($scope.project);
        
        operation
            .then(function(response) {
                AlertService.success('Success', $scope.isEditing ? 'Project updated!' : 'Project created!');
                $location.path('/projects');
            })
            .catch(function(error) {
                AlertService.error('Error', error.message || 'Failed to save project.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
    
    // Delete project
    $scope.deleteProject = function(project) {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }
        
        ProjectService.delete(project.id)
            .then(function() {
                $scope.projects = $scope.projects.filter(p => p.id !== project.id);
                AlertService.success('Deleted', 'Project deleted successfully.');
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to delete project.');
            });
    };
    
    init();
}])

.controller('BlogController', ['$scope', '$routeParams', '$location', 'BlogService', 'AlertService',
function($scope, $routeParams, $location, BlogService, AlertService) {
    $scope.blogs = [];
    $scope.blog = {};
    $scope.isEditing = false;
    $scope.loading = false;
    
    // Initialize
    function init() {
        if ($routeParams.id) {
            $scope.isEditing = true;
            loadBlog($routeParams.id);
        } else if ($location.path().includes('/new')) {
            $scope.blog = {
                title: '',
                excerpt: '',
                content: '',
                tags: [],
                category: 'general',
                status: 'draft',
                featured: false
            };
        } else {
            loadBlogs();
        }
    }
    
    // Load blogs
    function loadBlogs() {
        $scope.loading = true;
        
        BlogService.getAll()
            .then(function(response) {
                $scope.blogs = response.blogs || [];
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to load blogs.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Load single blog
    function loadBlog(id) {
        $scope.loading = true;
        
        BlogService.get(id)
            .then(function(response) {
                $scope.blog = response.blog;
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to load blog post.');
                $location.path('/blogs');
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Save blog
    $scope.saveBlog = function() {
        $scope.loading = true;
        
        const operation = $scope.isEditing 
            ? BlogService.update($scope.blog.id, $scope.blog)
            : BlogService.create($scope.blog);
        
        operation
            .then(function(response) {
                AlertService.success('Success', $scope.isEditing ? 'Blog updated!' : 'Blog created!');
                $location.path('/blogs');
            })
            .catch(function(error) {
                AlertService.error('Error', error.message || 'Failed to save blog post.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
    
    // Delete blog
    $scope.deleteBlog = function(blog) {
        if (!confirm('Are you sure you want to delete this blog post?')) {
            return;
        }
        
        BlogService.delete(blog.id)
            .then(function() {
                $scope.blogs = $scope.blogs.filter(b => b.id !== blog.id);
                AlertService.success('Deleted', 'Blog post deleted successfully.');
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to delete blog post.');
            });
    };
    
    init();
}])

.controller('PortfolioController', ['$scope', '$routeParams', '$sce', 'PortfolioService', 'ProjectService', 'BlogService', 'ResumeService',
function($scope, $routeParams, $sce, PortfolioService, ProjectService, BlogService, ResumeService) {
    $scope.portfolio = null;
    $scope.projects = [];
    $scope.blogs = [];
    $scope.resume = null;
    $scope.loading = true;
    
    const username = $routeParams.username;
    
    // Load portfolio data
    function loadPortfolio() {
        console.log('Loading portfolio for username:', username);
        
        // Load basic portfolio info
        PortfolioService.getPortfolio(username)
            .then(function(response) {
                console.log('Portfolio response:', response);
                $scope.portfolio = response.portfolio;
            })
            .catch(function(error) {
                console.error('Portfolio load error:', error);
                $scope.error = 'Portfolio not found';
            });
        
        // Load projects
        ProjectService.getByUsername(username, { limit: 6 })
            .then(function(response) {
                console.log('Projects response:', response);
                $scope.projects = response.projects || [];
            })
            .catch(function(error) {
                console.error('Projects load error:', error);
            });
        
        // Load blogs
        BlogService.getByUsername(username, { limit: 3 })
            .then(function(response) {
                console.log('Blogs response:', response);
                $scope.blogs = response.blogs || [];
            })
            .catch(function(error) {
                console.error('Blogs load error:', error);
            });
        
        // Load resume
        ResumeService.getByUsername(username)
            .then(function(response) {
                console.log('Resume response:', response);
                $scope.resume = response.resume;
                // Also attach to portfolio object for template convenience if already loaded
                if ($scope.portfolio) {
                    $scope.portfolio.resume = response.resume;
                }
            })
            .catch(function(error) {
                console.error('Resume load error:', error);
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Helper functions for template
    $scope.hasSocialLinks = function() {
        if (!$scope.portfolio || !$scope.portfolio.user || !$scope.portfolio.user.profile) {
            return false;
        }
        const profile = $scope.portfolio.user.profile;
        return profile.github || profile.linkedin || profile.twitter || profile.website;
    };

    // Trusted URL for iframe preview of the PDF
    $scope.getTrustedResumeUrl = function() {
        if (!$scope.resume || !$scope.resume.originalUrl) return null;
        var url = $scope.resume.originalUrl;
        // Ensure raw delivery endpoint for PDFs
        url = url.replace('/image/upload/', '/raw/upload/');
        return $sce.trustAsResourceUrl(url);
    };
    
    $scope.getProjectsByCategory = function(category) {
        return $scope.projects.filter(function(project) {
            return project.category === category;
        });
    };
    
    $scope.truncateText = function(text, limit) {
        if (!text) return '';
        if (text.length <= limit) return text;
        return text.substring(0, limit) + '...';
    };
    
    loadPortfolio();
}])

.controller('AdminController', ['$scope', 'AlertService',
function($scope, AlertService) {
    $scope.stats = {
        totalUsers: 150,
        totalProjects: 450,
        totalBlogs: 280,
        activeUsers: 120
    };
    
    $scope.users = [];
    $scope.loading = false;
    
    // Mock admin functionality
    AlertService.info('Demo Mode', 'Admin functionality is in demo mode.');
}]);