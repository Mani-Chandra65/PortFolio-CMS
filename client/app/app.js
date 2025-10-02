// Main Angular Application Module
angular.module('portfolioApp', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        // Home/Landing Page
        .when('/', {
            templateUrl: 'app/views/home.html',
            controller: 'HomeController'
        })
        
        // Authentication Routes
        .when('/login', {
            templateUrl: 'app/views/auth/login.html',
            controller: 'AuthController'
        })
        .when('/register', {
            templateUrl: 'app/views/auth/register.html',
            controller: 'AuthController'
        })
        
        // Dashboard Routes (Private)
        .when('/dashboard', {
            templateUrl: 'app/views/dashboard/overview.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        .when('/dashboard/overview', {
            templateUrl: 'app/views/dashboard/overview.html',
            controller: 'DashboardController'
        })
        .when('/dashboard/profile', {
            templateUrl: 'app/views/dashboard/profile.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        
        // Resume Management
        .when('/dashboard/resume', {
            templateUrl: 'app/views/dashboard/resume.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        
        // Project Management
        .when('/dashboard/projects', {
            templateUrl: 'app/views/dashboard/projects.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        
        // Blog Management
        .when('/dashboard/blogs', {
            templateUrl: 'app/views/dashboard/blogs.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        .when('/dashboard/blogs/new', {
            templateUrl: 'app/views/dashboard/blogs.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        .when('/blogs/edit/:id', {
            templateUrl: 'app/views/dashboard/blogs.html',
            controller: 'DashboardController',
            resolve: {
                auth: function(AuthService) {
                    return AuthService.requireAuth();
                }
            }
        })
        
        // Public Portfolio Routes
        .when('/portfolio/:username', {
            templateUrl: 'app/views/portfolio/view.html',
            controller: 'PortfolioController'
        })
        
        // Admin Routes
        .when('/admin', {
            templateUrl: 'app/views/admin/dashboard.html',
            controller: 'AdminController',
            resolve: {
                adminAuth: function(AuthService) {
                    return AuthService.requireAdmin();
                }
            }
        })
        .when('/admin/users', {
            templateUrl: 'app/views/admin/users.html',
            controller: 'AdminController',
            resolve: {
                adminAuth: function(AuthService) {
                    return AuthService.requireAdmin();
                }
            }
        })
        
        // 404 Route
        .otherwise({
            templateUrl: 'app/views/404.html'
        });
        
    // Use HTML5 History API
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
}])

.run(['$rootScope', '$location', 'AuthService', 'AlertService', function($rootScope, $location, AuthService, AlertService) {
    // Global loading state
    $rootScope.loading = false;
    
    // Global alert system
    $rootScope.alerts = [];
    $rootScope.removeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };
    
    // Route change events
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        $rootScope.loading = true;
    });
    
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        $rootScope.loading = false;
    });
    
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        $rootScope.loading = false;
        
        if (rejection === 'AUTH_REQUIRED') {
            AlertService.error('Authentication required', 'Please login to access this page.');
            $location.path('/login');
        } else if (rejection === 'ADMIN_REQUIRED') {
            AlertService.error('Access denied', 'Admin privileges required.');
            $location.path('/dashboard');
        }
    });
    
    // Initialize authentication state
    AuthService.checkAuth();
}])

// Global constants
.constant('API_URL', '/api')
.constant('UPLOAD_LIMITS', {
    IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    PDF_SIZE: 10 * 1024 * 1024,  // 10MB
    MAX_IMAGES: 10
})

// Global filters
.filter('truncate', function() {
    return function(text, length, end) {
        if (!text) return '';
        length = parseInt(length, 10) || 100;
        end = end || '...';
        
        if (text.length <= length) {
            return text;
        }
        
        return text.substring(0, length - end.length) + end;
    };
})

.filter('timeAgo', function() {
    return function(date) {
        if (!date) return '';
        
        const now = new Date();
        const inputDate = new Date(date);
        const diffInSeconds = Math.floor((now - inputDate) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' minutes ago';
        if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hours ago';
        if (diffInSeconds < 604800) return Math.floor(diffInSeconds / 86400) + ' days ago';
        
        return inputDate.toLocaleDateString();
    };
})

// Global directives
.directive('fileUpload', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            console.log('fileUpload directive linked');
            element.on('change', function(e) {
                console.log('fileUpload: change event');
                if (e.target.files && e.target.files[0]) {
                    var file = e.target.files[0];
                    console.log('fileUpload: file selected:', file.name);
                    scope.$apply(function() {
                        // Set on current (possibly child) scope
                        scope.selectedFile = file;
                        console.log('fileUpload: scope.selectedFile set');
                        // Also propagate up to parent scopes to avoid ng-if child scope shadowing
                        var hops = 0;
                        var parent = scope.$parent;
                        while (parent && hops < 3) { // bubble a few levels just in case
                            try {
                                parent.selectedFile = file;
                            } catch (err) {}
                            parent = parent.$parent;
                            hops++;
                        }
                        console.log('fileUpload: propagated selectedFile up to parent scopes');
                    });
                }
            });
        }
    };
})
.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            const model = $parse(attrs.fileModel);
            const modelSetter = model.assign;
            
            element.bind('change', function(event) {
                console.log('fileModel directive: change event triggered');
                console.log('Event target:', event.target);
                console.log('Files selected:', element[0].files.length);
                
                try {
                    scope.$apply(function() {
                        if (element[0].files && element[0].files.length > 0) {
                            const selectedFile = element[0].files[0];
                            console.log('fileModel directive: setting file:', selectedFile.name, selectedFile.type);
                            modelSetter(scope, selectedFile);
                            console.log('fileModel directive: model set, checking scope value:', scope.selectedFile);
                            
                            // Trigger handleFileChange if it exists
                            if (scope.handleFileChange && typeof scope.handleFileChange === 'function') {
                                console.log('fileModel directive: calling handleFileChange');
                                scope.handleFileChange();
                            }
                        } else {
                            console.log('fileModel directive: no files selected, clearing model');
                            modelSetter(scope, null);
                        }
                    });
                } catch (error) {
                    console.error('fileModel directive error:', error);
                }
            });
        }
    };
}])

.directive('loading', function() {
    return {
        restrict: 'E',
        template: '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>'
    };
})
// Generic file change directive to avoid inline handlers (CSP-safe)
.directive('fileChange', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.fileChange);
            element.on('change', function(event) {
                var files = (event.target && event.target.files) ? event.target.files : [];
                scope.$apply(function(){ fn(scope, { files: files }); });
            });
        }
    };
}]);