angular.module('portfolioApp')
.controller('DashboardController', ['$scope', '$location', '$routeParams', 'AuthService', 'UserService', 'ProjectService', 'BlogService', 'ResumeService', 'AlertService',
function($scope, $location, $routeParams, AuthService, UserService, ProjectService, BlogService, ResumeService, AlertService) {
    
    $scope.currentUser = AuthService.getCurrentUser();
    $scope.user = $scope.currentUser; // Alias for template compatibility
    $scope.activeTab = 'overview';
    $scope.loading = false;
    
    // Set portfolio URL
    if ($scope.user && $scope.user.username) {
        $scope.portfolioUrl = window.location.origin + '/#!/portfolio/' + $scope.user.username;
    }
    
    // Check if current route is active
    $scope.isActive = function(route) {
        return $location.path() === route;
    };
    
    // Portfolio URL for sharing
    $scope.portfolioUrl = 'http://localhost:3000/#!/portfolio/' + ($scope.user ? $scope.user.username : '');
    
    // Utility functions
    $scope.copyToClipboard = function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                AlertService.success('Copied!', 'Portfolio URL copied to clipboard.');
            }).catch(function() {
                AlertService.error('Error', 'Failed to copy to clipboard.');
            });
        } else {
            AlertService.error('Error', 'Clipboard not supported by your browser.');
        }
    };
    
    $scope.openPortfolio = function() {
        if ($scope.user && $scope.user.username) {
            window.open('/#!/portfolio/' + $scope.user.username, '_blank');
        }
    };
    
    // Helper functions for templates
    $scope.selectText = function(event) {
        event.target.select();
    };
    
    $scope.copyToClipboard = function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                AlertService.success('Copied!', 'Portfolio URL copied to clipboard.');
            }).catch(function() {
                AlertService.error('Error', 'Failed to copy to clipboard.');
            });
        } else {
            AlertService.error('Error', 'Clipboard API not supported.');
        }
    };
    
    $scope.triggerFileInput = function() {
        console.log('triggerFileInput called');
        var fileInput = document.getElementById('resumeFile');
        if (fileInput) {
            fileInput.click();
        } else {
            console.error('resumeFile input not found');
        }
    };
    
    // Handle file selection for resume
    $scope.handleFileSelect = function(files) {
        if (files && files.length > 0) {
            $scope.selectedFile = files[0];
            $scope.showUploadDialog = true;
        }
    };
    
    $scope.handleFileChange = function() {
        console.log('handleFileChange called, selectedFile:', $scope.selectedFile);
        if ($scope.selectedFile) {
            $scope.showUploadDialog = true;
            console.log('showUploadDialog set to true');
        }
    };
    
    $scope.triggerFileUpload = function() {
        $scope.showUploadForm = true;
        // Small delay to ensure DOM is updated
        setTimeout(function() {
            var fileInput = document.getElementById('resumeFile');
            if (fileInput) {
                fileInput.click();
            }
        }, 100);
    };
    
    $scope.cancelUpload = function() {
        $scope.selectedFile = null;
        $scope.showUploadForm = false;
    };
    
    // Compute public resume URL for templates
    $scope.getResumePublicUrl = function() {
        if ($scope.user && $scope.user.username) {
            return window.location.origin + '/#!/portfolio/' + $scope.user.username;
        }
        return '#';
    };
    
    // Format file size helper
    $scope.formatFileSize = function(bytes) {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // Dashboard stats
    $scope.stats = {
        projects: 0,
        blogs: 0,
        views: 0,
        likes: 0
    };
    
    // Data arrays
    $scope.projects = [];
    $scope.blogs = [];
    $scope.recentProjects = [];
    $scope.recentBlogs = [];
    
    // Profile form data
    $scope.profileData = {
        firstName: '',
        lastName: '',
        title: '',
        bio: '',
        location: '',
        phone: '',
        website: '',
        socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            facebook: '',
            instagram: ''
        }
    };
    
    // Initialize
    function init() {
        loadProfile();
        loadProjects();
        loadBlogs();
        loadStats();
        
        // Check if we should auto-open modals based on route
        var currentPath = $location.path();
        if (currentPath === '/dashboard/blogs/new') {
            // Auto-open blog modal for /new route
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.openBlogModal();
                });
            }, 500);
        }
    }
    
    // Load user profile
    function loadProfile() {
        $scope.loading = true;
        
        UserService.getProfile()
            .then(function(response) {
                if (response.user) {
                    $scope.user = response.user;
                    $scope.profileData = angular.extend($scope.profileData, response.user.profile || {});
                    
                    // Initialize socialLinks if not present
                    if (!$scope.user.profile) {
                        $scope.user.profile = {};
                    }
                    if (!$scope.user.profile.socialLinks) {
                        $scope.user.profile.socialLinks = {};
                    }
                }
            })
            .catch(function(error) {
                AlertService.error('Error', 'Failed to load profile data.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    }
    
    // Load dashboard stats
    function loadStats() {
        $scope.stats = {
            projects: $scope.projects.length,
            blogs: $scope.blogs.length,
            views: 120, // TODO: Implement view tracking
            likes: 45   // TODO: Implement like tracking
        };
    }
    
    // Load projects
    function loadProjects() {
        ProjectService.getAll()
            .then(function(response) {
                $scope.projects = response.projects || [];
                $scope.recentProjects = $scope.projects.slice(0, 3);
                $scope.filterProjects(); // Initialize filtered projects
                loadStats(); // Update stats after loading
            })
            .catch(function(error) {
                console.error('Error loading projects:', error);
                AlertService.error('Error', 'Failed to load projects.');
            });
    }
    
    // Load blogs
    function loadBlogs() {
        BlogService.getAll()
            .then(function(response) {
                $scope.blogs = response.blogs || [];
                $scope.recentBlogs = $scope.blogs.slice(0, 3);
                loadStats(); // Update stats after loading
            })
            .catch(function(error) {
                console.error('Error loading blogs:', error);
                AlertService.error('Error', 'Failed to load blogs.');
            });
    }
    
    // Update profile
    $scope.updateProfile = function() {
        if ($scope.profileForm.$invalid) {
            AlertService.error('Invalid Input', 'Please fill in all required fields correctly.');
            return;
        }
        
        $scope.loading = true;
        
        // Prepare data from user object
        var profileData = {
            firstName: $scope.user.profile.firstName,
            lastName: $scope.user.profile.lastName,
            title: $scope.user.profile.title,
            bio: $scope.user.profile.bio,
            location: $scope.user.profile.location,
            phone: $scope.user.profile.phone,
            website: $scope.user.profile.website,
            socialLinks: $scope.user.profile.socialLinks
        };
        
        UserService.updateProfile(profileData)
            .then(function(response) {
                AlertService.success('Success', 'Profile updated successfully.');
                
                // Update user data
                if (response.user) {
                    $scope.user = response.user;
                    if (AuthService && typeof AuthService.setCurrentUser === 'function') {
                        AuthService.setCurrentUser(response.user);
                    }
                    // Recompute portfolio URL if username changed
                    $scope.portfolioUrl = window.location.origin + '/#!/portfolio/' + $scope.user.username;
                }
            })
            .catch(function(error) {
                AlertService.error('Error', error.data?.message || error.message || 'Failed to update profile.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
    
    // Navigate to different sections
    $scope.navigateTo = function(section) {
        switch(section) {
            case 'resume':
                $location.path('/resume');
                break;
            case 'projects':
                $location.path('/projects');
                break;
            case 'blogs':
                $location.path('/blogs');
                break;
            case 'portfolio':
                window.open('/#!/portfolio/' + $scope.currentUser.username, '_blank');
                break;
            default:
                $scope.activeTab = section;
        }
    };
    
    // Get portfolio URL
    $scope.getPortfolioUrl = function() {
        return window.location.origin + '/#!/portfolio/' + $scope.currentUser.username;
    };
    
    // Copy portfolio URL to clipboard
    $scope.copyPortfolioUrl = function() {
        const url = $scope.getPortfolioUrl();
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
                AlertService.success('Copied!', 'Portfolio URL copied to clipboard.');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            AlertService.success('Copied!', 'Portfolio URL copied to clipboard.');
        }
    };
    
    // ============ PROJECT MANAGEMENT ============
    
    // Project form data
    $scope.projectForm = {
        title: '',
        shortDescription: '',
        description: '',
        technologies: [],
        category: '',
        status: 'draft',
        demoUrl: '',
        githubUrl: '',
        featured: false
    };
    
    $scope.isEditingProject = false;
    $scope.currentProjectId = null;
    $scope.projectFormErrors = {};
    $scope.newTechnology = '';
    
    // Project categories - map display names to backend values
    $scope.projectCategories = [
        { label: 'Web Development', value: 'web' },
        { label: 'Mobile App', value: 'mobile' }, 
        { label: 'Desktop App', value: 'desktop' },
        { label: 'API/Backend', value: 'api' },
        { label: 'Other', value: 'other' }
    ];
    
    // Template variables
    $scope.editingProject = false;
    $scope.currentProject = {};
    $scope.isSaving = false;
    $scope.filteredProjects = [];
    $scope.searchQuery = '';
    $scope.blogSearchQuery = '';
    $scope.filterStatus = '';
    $scope.filterCategory = '';
    
    // Open project modal function
    $scope.openProjectModal = function() {
        console.log('openProjectModal function called');
        
        // Initialize project data
        $scope.editingProject = false;
        $scope.currentProject = {
            title: '',
            description: '',
            category: '',
            technologies: [],
            demoUrl: '',
            githubUrl: '',
            imageUrl: '',
            status: 'completed' // Default status
        };
        $scope.newTechnology = '';
        
        // Reset form validation
        if ($scope.projectForm) {
            $scope.projectForm.$setPristine();
            $scope.projectForm.$setUntouched();
        }
        
        // Clean up any existing modals first
        $scope.cleanupModal();
        
        // Open modal using Bootstrap JavaScript API
        var modalElement = document.getElementById('projectModal');
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        } else {
            console.error('Modal element not found');
        }
    };
    
    // Add project function for modal (legacy)
    $scope.addProject = function() {
        $scope.openProjectModal();
    };
    
    // Cleanup modal function
    $scope.cleanupModal = function() {
        // Remove any existing modal backdrops
        var backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            backdrop.remove();
        });
        
        // Reset body classes and styles
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Hide any existing modal instances
        var modalElement = document.getElementById('projectModal');
        if (modalElement) {
            var existingModal = bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
                existingModal.dispose();
            }
        }
    };
    
    // Get category display name helper
    $scope.getCategoryDisplayName = function(categoryValue) {
        var categoryMap = {
            'web': 'Web Development',
            'mobile': 'Mobile App',
            'desktop': 'Desktop App',
            'api': 'API/Backend',
            'other': 'Other'
        };
        return categoryMap[categoryValue] || categoryValue;
    };
    
    // Edit project function
    $scope.editProject = function(project) {
        console.log('Editing project:', project);
        $scope.editingProject = true;
        $scope.currentProject = {
            _id: project._id || project.id,
            title: project.title,
            description: project.description,
            category: project.category,
            technologies: angular.copy(project.technologies) || [],
            demoUrl: project.demoUrl || '',
            githubUrl: project.githubUrl || '',
            imageUrl: project.imageUrl || (project.images && project.images[0] ? project.images[0].url : ''),
            status: project.status || 'completed'
        };
        $scope.newTechnology = '';
        
        // Clean up any existing modals first
        $scope.cleanupModal();
        
        // Open modal using Bootstrap JavaScript API
        var modalElement = document.getElementById('projectModal');
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        } else {
            console.error('Modal element not found');
        }
    };
    
    // Save project function (create or update)
    $scope.saveProject = function() {
        console.log('saveProject called');
        console.log('Form valid:', !$scope.projectForm.$invalid);
        console.log('Current project:', $scope.currentProject);
        
        if ($scope.projectForm.$invalid) {
            console.log('Form is invalid');
            AlertService.error('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }
        
        $scope.isSaving = true;
        
        var savePromise;
        if ($scope.editingProject) {
            console.log('Updating project');
            savePromise = ProjectService.update($scope.currentProject._id, $scope.currentProject);
        } else {
            console.log('Creating new project');
            savePromise = ProjectService.create($scope.currentProject);
        }
        
        savePromise
            .then(function(response) {
                console.log('Project save successful:', response);
                AlertService.success('Success!', $scope.editingProject ? 'Project updated successfully.' : 'Project created successfully.');
                
                // Reset form and clear data
                $scope.currentProject = {};
                $scope.newTechnology = '';
                $scope.editingProject = false;
                
                // Reset form validation state
                if ($scope.projectForm) {
                    $scope.projectForm.$setPristine();
                    $scope.projectForm.$setUntouched();
                }
                
                // Reload projects
                loadProjects();
                
                // Close modal using Bootstrap API with cleanup
                var modalElement = document.getElementById('projectModal');
                if (modalElement) {
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    } else {
                        // If no instance exists, create one and hide it
                        modal = new bootstrap.Modal(modalElement);
                        modal.hide();
                    }
                    
                    // Force remove backdrop and modal classes after a delay
                    setTimeout(function() {
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        var backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(function(backdrop) {
                            backdrop.remove();
                        });
                    }, 300);
                }
            })
            .catch(function(error) {
                console.error('Project save failed:', error);
                var errorMsg = 'Failed to save project.';
                
                if (error.data) {
                    if (error.data.message) {
                        errorMsg = error.data.message;
                    } else if (error.data.error) {
                        errorMsg = error.data.error;
                    } else if (typeof error.data === 'string') {
                        errorMsg = error.data;
                    }
                }
                
                AlertService.error('Error', errorMsg);
            })
            .finally(function() {
                $scope.isSaving = false;
            });
    };
    
    // Delete project function
    $scope.deleteProject = function(project) {
        if (confirm('Are you sure you want to delete "' + project.title + '"?')) {
            ProjectService.delete(project._id)
                .then(function() {
                    AlertService.success('Success!', 'Project deleted successfully.');
                    loadProjects();
                })
                .catch(function(error) {
                    AlertService.error('Error', error.message || 'Failed to delete project.');
                });
        }
    };
    
    // Technology management
    $scope.addTechnology = function(event) {
        // Only proceed on Enter key press or button click
        if (event && event.keyCode !== 13 && event.type !== 'click') return;
        
        if ($scope.newTechnology && $scope.newTechnology.trim()) {
            // Initialize technologies array if undefined
            if (!$scope.currentProject.technologies) {
                $scope.currentProject.technologies = [];
            }
            
            var tech = $scope.newTechnology.trim();
            if ($scope.currentProject.technologies.indexOf(tech) === -1) {
                $scope.currentProject.technologies.push(tech);
                $scope.newTechnology = '';
            }
        }
    };
    
    $scope.removeTechnology = function(index) {
        $scope.currentProject.technologies.splice(index, 1);
    };
    
    // Image upload handler
    $scope.handleImageUpload = function(file) {
        if (file && file.type.startsWith('image/')) {
            // For now, just create a preview URL
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.currentProject.imageUrl = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Filter projects function
    $scope.filterProjects = function() {
        $scope.filteredProjects = $scope.projects.filter(function(project) {
            var matchesSearch = !$scope.searchQuery || 
                project.title.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes($scope.searchQuery.toLowerCase());
            
            var matchesStatus = !$scope.filterStatus || project.status === $scope.filterStatus;
            var matchesCategory = !$scope.filterCategory || project.category === $scope.filterCategory;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    };
    
    // Create new project
    $scope.createProject = function() {
        if (!validateProjectForm()) return;
        
        $scope.loading = true;
        
        ProjectService.create($scope.projectForm)
            .then(function(response) {
                AlertService.success('Success!', 'Project created successfully.');
                $scope.resetProjectForm();
                loadProjects();
                // Close modal if using Bootstrap modal
                if (window.bootstrap) {
                    var modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
                    if (modal) modal.hide();
                }
            })
            .catch(function(error) {
                AlertService.error('Error', error.message || 'Failed to create project.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
    
    // Duplicate editProject function removed
    
    // Update project
    $scope.updateProject = function() {
        if (!validateProjectForm()) return;
        
        $scope.loading = true;
        
        ProjectService.update($scope.currentProjectId, $scope.projectForm)
            .then(function(response) {
                AlertService.success('Success!', 'Project updated successfully.');
                $scope.resetProjectForm();
                loadProjects();
                if (window.bootstrap) {
                    var modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
                    if (modal) modal.hide();
                }
            })
            .catch(function(error) {
                AlertService.error('Error', error.message || 'Failed to update project.');
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
    
    // Delete project
    $scope.deleteProject = function(project) {
        if (!confirm('Are you sure you want to delete "' + project.title + '"?')) {
            return;
        }
        
        ProjectService.delete(project.id)
            .then(function() {
                AlertService.success('Success!', 'Project deleted successfully.');
                loadProjects();
            })
            .catch(function(error) {
                AlertService.error('Error', error.message || 'Failed to delete project.');
            });
    };
    
    // Duplicate function removed - using the correct one above
    
    // Remove technology tag (duplicate function removed)
    
    // Reset project form
    $scope.resetProjectForm = function() {
        $scope.projectForm = {
            title: '',
            shortDescription: '',
            description: '',
            technologies: [],
            category: '',
            status: 'draft',
            demoUrl: '',
            githubUrl: '',
            featured: false
        };
        $scope.isEditingProject = false;
        $scope.currentProjectId = null;
        $scope.projectFormErrors = {};
        $scope.newTechnology = '';
    };
    
    // Validate project form
    function validateProjectForm() {
        $scope.projectFormErrors = {};
        let isValid = true;
        
        if (!$scope.projectForm.title || $scope.projectForm.title.trim().length < 3) {
            $scope.projectFormErrors.title = 'Title must be at least 3 characters long';
            isValid = false;
        }
        
        if (!$scope.projectForm.shortDescription || $scope.projectForm.shortDescription.trim().length < 10) {
            $scope.projectFormErrors.shortDescription = 'Short description must be at least 10 characters long';
            isValid = false;
        }
        
        if (!$scope.projectForm.description || $scope.projectForm.description.trim().length < 20) {
            $scope.projectFormErrors.description = 'Description must be at least 20 characters long';
            isValid = false;
        }
        
        if (!$scope.projectForm.category) {
            $scope.projectFormErrors.category = 'Please select a category';
            isValid = false;
        }
        
        if ($scope.projectForm.technologies.length === 0) {
            $scope.projectFormErrors.technologies = 'Please add at least one technology';
            isValid = false;
        }
        
        return isValid;
    }
    
    // ============ BLOG MANAGEMENT ============
    
    // Blog state variables
    $scope.currentBlog = {};
    $scope.editingBlog = false;
    $scope.isSavingBlog = false;
    $scope.filteredBlogs = [];
    
    // Blog categories
    $scope.blogCategories = [
        'Technology',
        'Programming',
        'Tutorial',
        'Personal',
        'Industry',
        'Other'
    ];
    
    // Filter blogs function
    $scope.filterBlogs = function() {
        $scope.filteredBlogs = $scope.blogs.filter(function(blog) {
            var matchesSearch = !$scope.searchQuery || 
                blog.title.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
                (blog.excerpt && blog.excerpt.toLowerCase().includes($scope.searchQuery.toLowerCase()));
            
            var matchesStatus = !$scope.filterStatus || blog.status === $scope.filterStatus;
            var matchesCategory = !$scope.filterCategory || blog.category === $scope.filterCategory;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    };
    
    // Initialize filtered blogs when blogs load
    $scope.$watch('blogs', function() {
        $scope.filterBlogs();
    });
    
    // Open blog modal function
    $scope.openBlogModal = function() {
        console.log('openBlogModal function called');
        
        // Initialize blog data
        $scope.editingBlog = false;
        $scope.currentBlog = {
            title: '',
            excerpt: '',
            content: '',
            category: 'Technology',
            tags: [],
            featuredImage: '',
            status: 'draft'
        };
        $scope.newTag = '';
        
        console.log('Initialized currentBlog:', $scope.currentBlog);
        
        // Reset form validation
        if ($scope.blogForm) {
            $scope.blogForm.$setPristine();
            $scope.blogForm.$setUntouched();
        }
        
        // Clean up any existing modals first
        $scope.cleanupBlogModal();
        
        // Open modal using Bootstrap JavaScript API
        var modalElement = document.getElementById('blogModal');
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        } else {
            console.error('Blog modal element not found');
        }
    };
    
    // Add blog function (legacy)
    $scope.addBlog = function() {
        $scope.openBlogModal();
    };
    
    // Cleanup blog modal function
    $scope.cleanupBlogModal = function() {
        var backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            backdrop.remove();
        });
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        var modalElement = document.getElementById('blogModal');
        if (modalElement) {
            var existingModal = bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
                existingModal.dispose();
            }
        }
    };
    
    // Edit blog function
    $scope.editBlog = function(blog) {
        console.log('Editing blog:', blog);
        
        if (!blog) {
            console.error('No blog provided to editBlog');
            AlertService.error('Error', 'Unable to edit blog: Invalid blog data');
            return;
        }
        
        var blogId = blog._id || blog.id;
        if (!blogId) {
            console.error('Blog has no ID:', blog);
            AlertService.error('Error', 'Unable to edit blog: No ID found');
            return;
        }
        
        $scope.editingBlog = true;
        $scope.currentBlog = {
            _id: blogId,
            title: blog.title,
            excerpt: blog.excerpt || '',
            content: blog.content,
            category: blog.category,
            tags: angular.copy(blog.tags) || [],
            featuredImage: blog.featuredImage || '',
            status: blog.status || 'draft'
        };
        $scope.newTag = '';
        
        console.log('Current blog set with ID:', $scope.currentBlog._id);
        
        // Clean up any existing modals first
        $scope.cleanupBlogModal();
        
        // Open modal
        var modalElement = document.getElementById('blogModal');
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        } else {
            console.error('Blog modal element not found');
        }
    };
    
    // Save blog function (create or update)
    $scope.saveBlog = function() {
        console.log('saveBlog called');
        console.log('Form valid:', !$scope.blogForm.$invalid);
        console.log('Current blog:', $scope.currentBlog);
        console.log('Form errors:', $scope.blogForm.$error);
        
        if ($scope.blogForm.$invalid) {
            console.log('Form is invalid');
            console.log('Invalid fields:', Object.keys($scope.blogForm.$error));
            AlertService.error('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }
        
        $scope.isSavingBlog = true;
        
        // Prepare data for submission
        var blogData = {
            title: $scope.currentBlog.title,
            excerpt: $scope.currentBlog.excerpt || '',
            content: $scope.currentBlog.content,
            category: $scope.currentBlog.category || 'Other',
            status: $scope.currentBlog.status || 'draft',
            tags: $scope.currentBlog.tags || []
        };
        
        console.log('Prepared blog data:', blogData);
        
        var savePromise;
        if ($scope.editingBlog) {
            var blogId = $scope.currentBlog._id;
            console.log('Updating blog with ID:', blogId);
            
            if (!blogId) {
                console.error('Cannot update blog: No ID found');
                AlertService.error('Error', 'Unable to update blog: Missing blog ID');
                $scope.isSavingBlog = false;
                return;
            }
            
            savePromise = BlogService.update(blogId, blogData);
        } else {
            console.log('Creating new blog');
            savePromise = BlogService.create(blogData);
        }
        
        savePromise
            .then(function(response) {
                console.log('Blog save successful:', response);
                AlertService.success('Success!', $scope.editingBlog ? 'Blog updated successfully.' : 'Blog created successfully.');
                
                // Reset form and clear data
                $scope.currentBlog = {};
                $scope.newTag = '';
                $scope.editingBlog = false;
                
                // Reset form validation state
                if ($scope.blogForm) {
                    $scope.blogForm.$setPristine();
                    $scope.blogForm.$setUntouched();
                }
                
                // Reload blogs
                loadBlogs();
                
                // Close modal with cleanup
                var modalElement = document.getElementById('blogModal');
                if (modalElement) {
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    } else {
                        modal = new bootstrap.Modal(modalElement);
                        modal.hide();
                    }
                    
                    setTimeout(function() {
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        var backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(function(backdrop) {
                            backdrop.remove();
                        });
                    }, 300);
                }
            })
            .catch(function(error) {
                console.error('Blog save failed:', error);
                var errorMsg = 'Failed to save blog.';
                
                if (error.data) {
                    if (error.data.message) {
                        errorMsg = error.data.message;
                    } else if (error.data.error) {
                        errorMsg = error.data.error;
                    } else if (typeof error.data === 'string') {
                        errorMsg = error.data;
                    }
                }
                
                AlertService.error('Error', errorMsg);
            })
            .finally(function() {
                $scope.isSavingBlog = false;
            });
    };
    
    // Delete blog function
    $scope.deleteBlog = function(blog) {
        if (confirm('Are you sure you want to delete "' + blog.title + '"?')) {
            BlogService.delete(blog._id || blog.id)
                .then(function() {
                    AlertService.success('Success!', 'Blog deleted successfully.');
                    loadBlogs();
                })
                .catch(function(error) {
                    console.error('Error deleting blog:', error);
                    AlertService.error('Error', error.message || 'Failed to delete blog.');
                });
        }
    };
    
    // Tag management for blogs
    $scope.addTag = function(event) {
        // Only proceed on Enter key press or button click
        if (event && event.keyCode !== 13 && event.type !== 'click') return;
        
        if ($scope.newTag && $scope.newTag.trim()) {
            // Initialize tags array if undefined
            if (!$scope.currentBlog.tags) {
                $scope.currentBlog.tags = [];
            }
            
            var tag = $scope.newTag.trim();
            if ($scope.currentBlog.tags.indexOf(tag) === -1) {
                $scope.currentBlog.tags.push(tag);
                $scope.newTag = '';
            }
        }
    };
    
    $scope.removeTag = function(index) {
        if ($scope.currentBlog.tags) {
            $scope.currentBlog.tags.splice(index, 1);
        }
    };
    
    // Handle blog image upload
    $scope.handleBlogImageUpload = function(file) {
        if (file && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.currentBlog.featuredImage = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Resume Management Functions
    $scope.resume = null;
    $scope.isUploadingResume = false;
    $scope.showUploadForm = false;
    $scope.selectedFile = null;
    $scope.uploading = false;
    
    // Load resume
    function loadResume() {
        ResumeService.get()
            .then(function(response) {
                $scope.resume = response.resume;
            })
            .catch(function(error) {
                console.log('No resume found or error loading resume:', error);
                $scope.resume = null;
            });
    }
    
    // Upload resume
    $scope.uploadResume = function() {
        console.log('uploadResume called, selectedFile:', $scope.selectedFile);
        
        if (!$scope.selectedFile) {
            AlertService.error('No File Selected', 'Please select a PDF file first.');
            return;
        }
        
        var file = $scope.selectedFile;
        console.log('File details:', file.name, file.type, file.size);
        
        // Validate file type
        if (file.type !== 'application/pdf') {
            AlertService.error('Invalid File', 'Please select a PDF file.');
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            AlertService.error('File Too Large', 'Please select a file smaller than 10MB.');
            return;
        }
        
        console.log('Starting upload...');
        $scope.isUploadingResume = true;
        $scope.uploading = true;
        
        ResumeService.upload(file)
            .then(function(response) {
                console.log('Upload successful:', response);
                AlertService.success('Success!', 'Resume uploaded successfully.');
                $scope.resume = response.resume;
                $scope.showUploadForm = false;
                $scope.selectedFile = null;
            })
            .catch(function(error) {
                console.error('Resume upload failed:', error);
                var errorMsg = 'Failed to upload resume.';
                
                // Handle timeout specifically
                if (error.status === -1 || error.code === 'timeout') {
                    errorMsg = 'Upload timeout. PDF processing may still be in progress. Please refresh the page in a moment.';
                } else if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                } else if (error.message) {
                    errorMsg = error.message;
                } else if (error.status === 504) {
                    errorMsg = 'Server timeout. PDF processing may still be in progress. Please refresh the page.';
                }
                
                AlertService.error('Upload Failed', errorMsg);
            })
            .finally(function() {
                $scope.isUploadingResume = false;
                $scope.uploading = false;
            });
    };
    
    // Delete resume
    $scope.deleting = false;
    $scope.deleteResume = function() {
        if (confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
            $scope.deleting = true;
            ResumeService.delete()
                .then(function() {
                    AlertService.success('Success!', 'Resume deleted successfully.');
                    $scope.resume = null;
                })
                .catch(function(error) {
                    console.error('Resume delete failed:', error);
                    AlertService.error('Delete Failed', 'Failed to delete resume.');
                })
                .finally(function(){
                    $scope.deleting = false;
                });
        }
    };

    // Support modal's confirmDelete button
    $scope.confirmDelete = function() {
        if ($scope.deleting) return;
        $scope.deleting = true;
        ResumeService.delete()
            .then(function() {
                AlertService.success('Success!', 'Resume deleted successfully.');
                $scope.resume = null;
            })
            .catch(function(error) {
                console.error('Resume delete failed:', error);
                AlertService.error('Delete Failed', 'Failed to delete resume.');
            })
            .finally(function(){
                $scope.deleting = false;
                try {
                    var modalEl = document.getElementById('deleteResumeModal');
                    if (modalEl) {
                        var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.hide();
                    }
                } catch (e) {}
            });
    };
    
    // Refresh resume preview
    $scope.refreshPreview = function() {
        loadResume();
    };
    
    // Debug function
    $scope.testFunction = function() {
        console.log('Test function called!');
        console.log('Current state:', {
            selectedFile: $scope.selectedFile,
            uploading: $scope.uploading,
            showUploadForm: $scope.showUploadForm,
            resume: $scope.resume
        });
    };
    
    // Initialize - load resume data
    function init() {
        loadProfile();
        loadProjects();
        loadBlogs();
        loadStats();
        loadResume(); // Add resume loading
        
        // Check if we should auto-open modals based on route
        var currentPath = $location.path();
        if (currentPath === '/dashboard/blogs/new') {
            // Auto-open blog modal for /new route
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.openBlogModal();
                });
            }, 500);
        }
    }
    
    // Profile helper functions
    $scope.getPortfolioUrl = function() {
        if ($scope.user && $scope.user.username) {
            return window.location.origin + '/#!/portfolio/' + $scope.user.username;
        }
        return '';
    };
    
    $scope.triggerProfilePictureUpload = function() {
        document.getElementById('profilePictureFile').click();
    };

    $scope.handleProfilePictureSelect = function(files) {
        if (!(files && files.length > 0)) return;
        const file = files[0];
        if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
            AlertService.error('Invalid file', 'Please select an image file (PNG, JPG, GIF, WebP).');
            return;
        }
        if (file.size > (5 * 1024 * 1024)) {
            AlertService.error('File too large', 'Max image size is 5MB.');
            return;
        }
        $scope.uploadingProfilePicture = true;
        UserService.uploadProfileImage(file)
            .then(function(resp){
                if (resp && resp.user) {
                    $scope.user = resp.user;
                    if (AuthService && typeof AuthService.setCurrentUser === 'function') {
                        AuthService.setCurrentUser(resp.user);
                    }
                    AlertService.success('Updated', 'Profile picture updated.');
                }
            })
            .catch(function(){
                AlertService.error('Error', 'Failed to upload profile picture.');
            })
            .finally(function(){
                $scope.uploadingProfilePicture = false;
            });
    };

    $scope.removeProfilePicture = function() {
        if (!confirm('Remove your profile picture?')) return;
        $scope.uploadingProfilePicture = true;
        UserService.removeProfileImage()
            .then(function(resp){
                if (resp && resp.user) {
                    $scope.user = resp.user;
                    if (AuthService && typeof AuthService.setCurrentUser === 'function') {
                        AuthService.setCurrentUser(resp.user);
                    }
                    AlertService.success('Removed', 'Profile picture removed.');
                }
            })
            .catch(function(){
                AlertService.error('Error', 'Failed to remove profile picture.');
            })
            .finally(function(){
                $scope.uploadingProfilePicture = false;
            });
    };

    init();
}]);