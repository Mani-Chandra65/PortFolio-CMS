angular.module('portfolioApp')
.controller('NavController', ['$scope', '$rootScope', '$location', 'AuthService', 'AlertService', 
function($scope, $rootScope, $location, AuthService, AlertService) {
    
    // Navigation state
    $scope.isAuthenticated = false;
    $scope.isAdmin = false;
    $scope.currentUser = null;
    
    // Initialize
    function init() {
        updateAuthState();
        AuthService.checkAuth();
    }
    
    // Update authentication state
    function updateAuthState() {
        $scope.isAuthenticated = AuthService.isAuthenticated();
        $scope.isAdmin = AuthService.isAdmin();
        $scope.currentUser = AuthService.getCurrentUser();
    }
    
    // Listen for auth events
    $rootScope.$on('auth:login', function(event, user) {
        updateAuthState();
        AlertService.success('Welcome!', 'You have successfully logged in.');
    });
    
    $rootScope.$on('auth:logout', function() {
        updateAuthState();
        AlertService.info('Goodbye!', 'You have been logged out.');
        $location.path('/');
    });
    
    $rootScope.$on('auth:check', function(event, user) {
        updateAuthState();
    });
    
    // Logout function
    $scope.logout = function() {
        AuthService.logout().then(function() {
            $location.path('/');
        });
    };
    
    // Check if current route is active
    $scope.isActive = function(route) {
        return $location.path() === route;
    };
    
    init();
}]);