'use strict';

angular.module('ManageFamiliesModule', ['WebCoreModule','OgtModule']);

angular.module('ManageFamiliesModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('manage-Families', {
		url: '/manage-Families',
		templateUrl: 'ogt/modules/manageFamilies/states/manageFamilies.html',
		controller: 'ManageFamiliesController',
		controllerAs: 'manageFamiliesCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['ManageFamilies:execute']
		}
	});
}]);