angular.module('portfolioApp')
.service('AlertService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    const service = {
        success: function(title, message, duration) {
            service.add('success', title, message, duration);
        },
        
        error: function(title, message, duration) {
            service.add('error', title, message, duration);
        },
        
        warning: function(title, message, duration) {
            service.add('warning', title, message, duration);
        },
        
        info: function(title, message, duration) {
            service.add('info', title, message, duration);
        },
        
        add: function(type, title, message, duration) {
            duration = duration || 5000;
            
            const alert = {
                type: type,
                title: title,
                message: message,
                show: true
            };
            
            $rootScope.alerts.push(alert);
            
            // Auto-remove after duration
            if (duration > 0) {
                $timeout(function() {
                    const index = $rootScope.alerts.indexOf(alert);
                    if (index > -1) {
                        $rootScope.alerts.splice(index, 1);
                    }
                }, duration);
            }
        },
        
        clear: function() {
            $rootScope.alerts = [];
        }
    };
    
    return service;
}]);