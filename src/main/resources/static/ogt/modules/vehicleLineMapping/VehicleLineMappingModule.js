'use strict';

angular.module('VehicleLineMappingModule', ['WebCoreModule']);

angular.module('VehicleLineMappingModule').config(['$stateProvider', function($stateProvider){
	$stateProvider.state('model-mapping', {
		url: '/model-mapping',
		templateUrl: 'ogt/modules/vehicleLineMapping/states/vehicleLineMapping/vehicleLineMappingList.html',
		controller: 'VehicleLineMappingController',
		controllerAs: 'vehicleLineMappingCtrl',
		parent: 'ogt-ui-app',
		data: {
			    policies: ['ModelMappings:execute']
		}
	});
}]);

