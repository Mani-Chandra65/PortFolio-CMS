angular.module('portfolioApp')
.controller('HomeController', ['$scope', '$location', 'AuthService', 
function($scope, $location, AuthService) {
    
    $scope.features = [
        {
            icon: 'fas fa-file-pdf',
            title: 'Resume Management',
            description: 'Upload your PDF resume and we\'ll convert it to beautiful images for web display.'
        },
        {
            icon: 'fas fa-project-diagram',
            title: 'Project Showcase',
            description: 'Display your projects with images, descriptions, and live demo links.'
        },
        {
            icon: 'fas fa-blog',
            title: 'Blog Platform',
            description: 'Share your thoughts and expertise through a built-in blogging system.'
        },
        {
            icon: 'fas fa-link',
            title: 'Unique Portfolio URL',
            description: 'Get your personalized portfolio link to share with employers and clients.'
        },
        {
            icon: 'fas fa-mobile-alt',
            title: 'Responsive Design',
            description: 'Your portfolio looks great on all devices - desktop, tablet, and mobile.'
        },
        {
            icon: 'fas fa-cloud',
            title: 'Cloud Storage',
            description: 'All your images and files are stored securely in the cloud with Cloudinary.'
        }
    ];
    
    $scope.stats = {
        users: '1,000+',
        portfolios: '800+',
        projects: '2,500+',
        blogs: '1,200+'
    };
    
    // Check if user is already authenticated
    if (AuthService.isAuthenticated()) {
        $location.path('/dashboard');
    }
    
    // Get started action
    $scope.getStarted = function() {
        if (AuthService.isAuthenticated()) {
            $location.path('/dashboard');
        } else {
            $location.path('/register');
        }
    };
    
    // View sample portfolio
    $scope.viewSample = function() {
        // Redirect to a sample portfolio (you can create a demo user)
        window.open('/#!/portfolio/demo-user', '_blank');
    };
}]);