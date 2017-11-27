'use strict';

angular.module('ModelSettingsModule', ['WebCoreModule','OgtModule']);

angular.module('ModelSettingsModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('view-models', {
		url: '/view-models',
		templateUrl: 'ogt/modules/modelSettings/states/viewModels/viewModels.html',
		controller: 'ViewModelsController',
		controllerAs: 'viewModelsCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['ViewModels:execute']
	  }
	});
	
	$stateProvider.state('model-settings', {
		url: '/model-settings',
		templateUrl: 'ogt/modules/modelSettings/states/modelSettings/modelSettings.html',
		controller: 'ModelSettingsController',
		controllerAs: 'modelSettingsCtrl',
		parent: 'ogt-ui-app',
		data: {
	    policies: ['ModelSettings:execute']
	  }
	});
}]);

