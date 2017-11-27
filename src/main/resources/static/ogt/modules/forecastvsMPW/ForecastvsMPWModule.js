'use strict';

angular.module('ForecastvsMPWModule', ['WebCoreModule','OgtModule']);

angular.module('ForecastvsMPWModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('forecast-mpw', {
		url: '/forecast-mpw',
		templateUrl: 'ogt/modules/forecastvsMPW/states/forecastvsMPW.html',
		controller: 'ForecastvsMPWController',
		controllerAs: 'forecastvsMPWCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['ForecastMpws:execute']
	  }
	});
}]);