angular.module('portfolioApp')
.service('PortfolioService', ['$http', 'API_URL', function($http, API_URL) {
    const service = {
        // Get complete portfolio by username
        getPortfolio: function(username) {
            return $http.get(API_URL + '/portfolio/' + username)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get portfolio statistics
        getStats: function(username) {
            return $http.get(API_URL + '/portfolio/' + username + '/stats')
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Update profile
        updateProfile: function(profileData) {
            return $http.put(API_URL + '/portfolio/profile', profileData)
                .then(function(response) {
                    return response.data;
                });
        }
    };
    
    return service;
}]);