angular.module('portfolioApp')
.service('UserService', ['$http', 'API_URL', function($http, API_URL) {
    const service = {
        // Get current user profile
        getProfile: function() {
            return $http.get(API_URL + '/users/profile')
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Update profile
        updateProfile: function(profileData) {
            return $http.put(API_URL + '/users/profile', profileData)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Change password
        changePassword: function(passwordData) {
            return $http.put(API_URL + '/users/password', passwordData)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Delete account
        deleteAccount: function() {
            return $http.delete(API_URL + '/users/account')
                .then(function(response) {
                    return response.data;
                });
        },

        // Upload profile image
        uploadProfileImage: function(file) {
            const formData = new FormData();
            formData.append('image', file);
            return $http.post(API_URL + '/users/profile/image', formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function(response) { return response.data; });
        },

        // Remove profile image
        removeProfileImage: function() {
            return $http.delete(API_URL + '/users/profile/image')
                .then(function(response) { return response.data; });
        }
    };
    
    return service;
}]);