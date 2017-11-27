angular.module('WebCoreModule')
    .directive('userInfo', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            transclude: true,
            templateUrl: 'ogt/components/userInfoDirective/userInfoDirectiveTemplate.html'
        };
    }]);
