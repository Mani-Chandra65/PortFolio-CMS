angular.module('portfolioApp')
.controller('AuthController', ['$scope', '$location', '$routeParams', 'AuthService', 'AlertService',
function($scope, $location, $routeParams, AuthService, AlertService) {
    
    // Form data
    $scope.loginData = {
        email: '',
        password: ''
    };
    
    $scope.registerData = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    };
    
    // Loading states
    $scope.loginLoading = false;
    $scope.registerLoading = false;
    
    // Form validation
    $scope.loginForm = {};
    $scope.registerForm = {};
    
    // Login function
    $scope.login = function() {
        if ($scope.loginForm.$invalid) {
            AlertService.error('Invalid Input', 'Please fill in all required fields correctly.');
            return;
        }
        
        $scope.loginLoading = true;
        
        AuthService.login($scope.loginData)
            .then(function(response) {
                AlertService.success('Welcome back!', 'You have successfully logged in.');
                $location.path('/dashboard');
            })
            .catch(function(error) {
                AlertService.error('Login Failed', error.message || 'Invalid email or password.');
            })
            .finally(function() {
                $scope.loginLoading = false;
            });
    };
    
    // Register function
    $scope.register = function() {
        if ($scope.registerForm.$invalid) {
            AlertService.error('Invalid Input', 'Please fill in all required fields correctly.');
            return;
        }
        
        if ($scope.registerData.password !== $scope.registerData.confirmPassword) {
            AlertService.error('Password Mismatch', 'Passwords do not match.');
            return;
        }
        
        if ($scope.registerData.password.length < 6) {
            AlertService.error('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }
        
        $scope.registerLoading = true;
        
        // Remove confirmPassword before sending
        const userData = angular.copy($scope.registerData);
        delete userData.confirmPassword;
        
        AuthService.register(userData)
            .then(function(response) {
                AlertService.success('Welcome!', 'Your account has been created successfully.');
                $location.path('/dashboard');
            })
            .catch(function(error) {
                if (error.errors && error.errors.length > 0) {
                    error.errors.forEach(function(err) {
                        AlertService.error('Registration Error', err.msg || err.message);
                    });
                } else {
                    AlertService.error('Registration Failed', error.message || 'Unable to create account.');
                }
            })
            .finally(function() {
                $scope.registerLoading = false;
            });
    };
    
    // Check username availability (debounced)
    let usernameCheckTimeout;
    $scope.checkUsername = function() {
        if (!$scope.registerData.username || $scope.registerData.username.length < 3) {
            $scope.usernameStatus = null;
            return;
        }
        
        clearTimeout(usernameCheckTimeout);
        usernameCheckTimeout = setTimeout(function() {
            // Simple client-side validation for now
            const validUsername = /^[a-zA-Z0-9_-]+$/.test($scope.registerData.username);
            $scope.usernameStatus = validUsername ? 'valid' : 'invalid';
            $scope.$apply();
        }, 500);
    };
    
    // Toggle password visibility
    $scope.showPassword = false;
    $scope.togglePasswordVisibility = function() {
        $scope.showPassword = !$scope.showPassword;
    };
    
    // Redirect if already authenticated
    if (AuthService.isAuthenticated()) {
        $location.path('/dashboard');
    }
}]);