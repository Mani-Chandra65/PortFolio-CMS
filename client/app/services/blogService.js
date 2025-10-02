angular.module('portfolioApp')
.service('BlogService', ['$http', 'API_URL', function($http, API_URL) {
    const service = {
        // Get current user's blogs
        getAll: function(params) {
            return $http.get(API_URL + '/blogs', { params: params })
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get blogs by username (public)
        getByUsername: function(username, params) {
            return $http.get(API_URL + '/blogs/' + username, { params: params })
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get single blog post
        get: function(id) {
            return $http.get(API_URL + '/blogs/post/' + id)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Get blog by username and slug (public)
        getBySlug: function(username, slug) {
            return $http.get(API_URL + '/blogs/' + username + '/' + slug)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Create blog post
        create: function(blogData, file) {
            const formData = new FormData();
            
            // Add blog data
            Object.keys(blogData).forEach(function(key) {
                if (blogData[key] !== null && blogData[key] !== undefined) {
                    if (Array.isArray(blogData[key])) {
                        formData.append(key, blogData[key].join(','));
                    } else {
                        formData.append(key, blogData[key]);
                    }
                }
            });
            
            // Add featured image
            if (file) {
                formData.append('featuredImage', file);
            }
            
            return $http.post(API_URL + '/blogs', formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response) {
                return response.data;
            });
        },
        
        // Update blog post
        update: function(id, blogData, file) {
            const formData = new FormData();
            
            // Add blog data
            Object.keys(blogData).forEach(function(key) {
                if (blogData[key] !== null && blogData[key] !== undefined) {
                    if (Array.isArray(blogData[key])) {
                        formData.append(key, blogData[key].join(','));
                    } else {
                        formData.append(key, blogData[key]);
                    }
                }
            });
            
            // Add featured image
            if (file) {
                formData.append('featuredImage', file);
            }
            
            return $http.put(API_URL + '/blogs/' + id, formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response) {
                return response.data;
            });
        },
        
        // Delete blog post
        delete: function(id) {
            return $http.delete(API_URL + '/blogs/' + id)
                .then(function(response) {
                    return response.data;
                });
        },
        
        // Like blog post
        like: function(id) {
            return $http.post(API_URL + '/blogs/' + id + '/like')
                .then(function(response) {
                    return response.data;
                });
        }
    };
    
    return service;
}]);