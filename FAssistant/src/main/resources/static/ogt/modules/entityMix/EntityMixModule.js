'use strict';

angular.module('EntityMixModule', ['WebCoreModule','OgtModule']);

angular.module('EntityMixModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('entity-mix', {
		url: '/entity-mix',
		templateUrl: 'ogt/modules/entityMix/states/entityMix.html',
		controller: 'EntityMixController',
		controllerAs: 'entityMixCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['EntityMix:execute']
	  }
	});
}]);