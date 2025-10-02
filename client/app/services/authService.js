angular.module('portfolioApp')
.service('AuthService', ['$http', '$q', '$rootScope', 'API_URL', function($http, $q, $rootScope, API_URL) {
    let currentUser = null;
    let token = localStorage.getItem('portfolio_token');
    
    // Set default authorization header
    if (token) {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
    
    const service = {
        // Authentication state
        isAuthenticated: function() {
            return !!token && !!currentUser;
        },
        
        isAdmin: function() {
            return currentUser && currentUser.role === 'admin';
        },
        
        getCurrentUser: function() {
            return currentUser;
        },
        // Update current user (used after profile updates)
        setCurrentUser: function(user) {
            currentUser = user;
            $rootScope.$broadcast('auth:check', currentUser);
        },
        
        // Login
        login: function(credentials) {
            return $http.post(API_URL + '/auth/login', credentials)
                .then(function(response) {
                    if (response.data.token) {
                        token = response.data.token;
                        currentUser = response.data.user;
                        
                        localStorage.setItem('portfolio_token', token);
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                        
                        $rootScope.$broadcast('auth:login', currentUser);
                    }
                    return response.data;
                })
                .catch(function(error) {
                    throw error.data || { message: 'Login failed' };
                });
        },
        
        // Register
        register: function(userData) {
            return $http.post(API_URL + '/auth/register', userData)
                .then(function(response) {
                    if (response.data.token) {
                        token = response.data.token;
                        currentUser = response.data.user;
                        
                        localStorage.setItem('portfolio_token', token);
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                        
                        $rootScope.$broadcast('auth:login', currentUser);
                    }
                    return response.data;
                })
                .catch(function(error) {
                    throw error.data || { message: 'Registration failed' };
                });
        },
        
        // Logout
        logout: function() {
            token = null;
            currentUser = null;
            
            localStorage.removeItem('portfolio_token');
            delete $http.defaults.headers.common['Authorization'];
            
            $rootScope.$broadcast('auth:logout');
            
            return $http.post(API_URL + '/auth/logout').catch(function() {
                // Ignore logout errors
            });
        },
        
        // Check current authentication status
        checkAuth: function() {
            if (!token) {
                return $q.resolve(false);
            }
            
            return $http.get(API_URL + '/auth/me')
                .then(function(response) {
                    currentUser = response.data.user;
                    $rootScope.$broadcast('auth:check', currentUser);
                    return true;
                })
                .catch(function() {
                    // Token is invalid
                    service.logout();
                    return false;
                });
        },
        
        // Route guards
        requireAuth: function() {
            if (!service.isAuthenticated()) {
                return $q.reject('AUTH_REQUIRED');
            }
            
            if (!currentUser) {
                return service.checkAuth().then(function(isAuth) {
                    if (!isAuth) {
                        return $q.reject('AUTH_REQUIRED');
                    }
                    return true;
                });
            }
            
            return $q.resolve(true);
        },
        
        requireAdmin: function() {
            return service.requireAuth().then(function() {
                if (!service.isAdmin()) {
                    return $q.reject('ADMIN_REQUIRED');
                }
                return true;
            });
        }
    };
    
    return service;
}]);