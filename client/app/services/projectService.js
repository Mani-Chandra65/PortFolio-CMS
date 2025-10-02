angular.module('portfolioApp')
.service('ProjectService', ['$http', 'API_URL', function($http, API_URL) {
    const service = {
        // Get current user's projects
        getAll: function(params) {
            return $http.get(API_URL + '/projects', { params: params })
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get projects by username (public)
        getByUsername: function(username, params) {
            return $http.get(API_URL + '/projects/' + username, { params: params })
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get single project
        get: function(id) {
            return $http.get(API_URL + '/projects/project/' + id)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Create project
        create: function(projectData, files) {
            const formData = new FormData();
            
            // Add project data
            Object.keys(projectData).forEach(function(key) {
                if (projectData[key] !== null && projectData[key] !== undefined) {
                    if (Array.isArray(projectData[key])) {
                        formData.append(key, projectData[key].join(','));
                    } else {
                        formData.append(key, projectData[key]);
                    }
                }
            });
            
            // Add files
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }
            }
            
            return $http.post(API_URL + '/projects', formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response) {
                return response.data;
            });
        },
        
        // Update project
        update: function(id, projectData, files) {
            const formData = new FormData();
            
            // Add project data
            Object.keys(projectData).forEach(function(key) {
                if (projectData[key] !== null && projectData[key] !== undefined) {
                    if (Array.isArray(projectData[key])) {
                        formData.append(key, projectData[key].join(','));
                    } else {
                        formData.append(key, projectData[key]);
                    }
                }
            });
            
            // Add files
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }
            }
            
            return $http.put(API_URL + '/projects/' + id, formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response) {
                return response.data;
            });
        },
        
        // Delete project
        delete: function(id) {
            return $http.delete(API_URL + '/projects/' + id)
                .then(function(response) {
                    return response.data;
                });
        }
    };
    
    return service;
}]);