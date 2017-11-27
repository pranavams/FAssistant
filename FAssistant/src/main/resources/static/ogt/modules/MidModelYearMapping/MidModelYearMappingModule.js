'use strict';

angular.module('MidModelYearMappingModule', ['WebCoreModule']);
angular.module('MidModelYearMappingModule').config(['$stateProvider', function($stateProvider){
	
	$stateProvider.state('mid-model-year-mappings', {
		url: '/mid-model-year-mappings',
		templateUrl: 'ogt/modules/MidModelYearMapping/states/MidModelYearMapping/MidModelYearMapping.html',
		controller: 'MidModelYearMappingController',
		controllerAs: 'midMyCtrl',
		parent: 'ogt-ui-app',
		data: {
			    policies: ['ChangeOverMappings:execute']
		},
		params : {
			from : undefined
		}

	});
	
	$stateProvider.state('create-edit-midmodelyear-mapping', {
		url: '/create-edit-midmodelyear-mapping',
		templateUrl: 'ogt/modules/MidModelYearMapping/states/MidModelYearMapping/createEditMidModelYearMapping/MidModelYearMappingCreateEdit.html',
		controller: 'MidModelYearMappingCreateEditController',
		controllerAs: 'midModelYearCreateEditCtrl',
		parent: 'ogt-ui-app',
		data: {
			    policies: ['ChangeOverMappings:execute']
		}

	});
	
	
}]);

