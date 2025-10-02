angular.module('portfolioApp')
.service('ResumeService', ['$http', 'API_URL', function($http, API_URL) {
    const service = {
        // Upload resume
        upload: function(file) {
            const formData = new FormData();
            formData.append('resume', file);
            
            return $http.post(API_URL + '/resume/upload', formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined},
                timeout: 60000 // 60 seconds timeout for file processing
            }).then(function(response) {
                return response.data;
            });
        },
        
        // Get current user's resume
        get: function() {
            return $http.get(API_URL + '/resume')
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get resume by username (public)
        getByUsername: function(username) {
            return $http.get(API_URL + '/resume/' + username)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Delete resume
        delete: function() {
            return $http.delete(API_URL + '/resume')
                .then(function(response) {
                    return response.data;
                });
        }
    };
    
    return service;
}]);