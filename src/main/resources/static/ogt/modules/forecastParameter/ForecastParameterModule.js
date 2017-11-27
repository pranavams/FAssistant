'use strict';

angular.module('ForecastParameterModule', ['WebCoreModule','OgtModule']);

angular.module('ForecastParameterModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('forecast-parameter', {
		url: '/forecast-parameter',
		templateUrl: 'ogt/modules/forecastParameter/states/forecastParameter/forecastParameter.html',
		controller: 'ForecastParameterController',
		controllerAs: 'forecastCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['ForecastParameters:execute']
	  }
	});
}]);

