'use strict';

angular.module('RenditionProposalModule').directive('stateChangeRendition',["RenditionProposalService", function(RenditionProposalService) {
    return {
    	restrict: "A",
    	require: "^ngController",
    	scope: {
    		stateChangeRendition: "@"
        },
    	controller: ["$scope", function($scope) {
    		$scope.onStateChange = function(ctrl) {
    			if(RenditionProposalService.currentModalArray.length > 0) {
    				ctrl.displayRenditionModal(changedTabObj);	
    			}
    		};
        }],
        
        link: function($scope, elem, attrs, ctrl) {
            /*window.onbeforeunload = function() {
               return "";
            };*/
            $scope.$on('$stateChangeStart', function(event, toState, fromState) {
                $scope.onStateChange(ctrl);
            });
        }
    
    };
}]);