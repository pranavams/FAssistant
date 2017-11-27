'use strict';

angular.module('WersEntityMappingModule', ['WebCoreModule','OgtModule']);

angular.module('WersEntityMappingModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('wers-entity-mappings', {
		url: '/wers-entity-mappings',
		templateUrl: 'ogt/modules/wersEntityMapping/states/wersEntityMapping.html',
		controller: 'WersEntityMappingController',
		controllerAs: 'wersEntityMappingCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['WERSEntityMapping:execute']
		}
	});
}]);