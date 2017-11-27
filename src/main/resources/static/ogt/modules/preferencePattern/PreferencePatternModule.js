'use strict';

angular.module('PreferencePatternModule', ['WebCoreModule','OgtModule']);

angular.module('PreferencePatternModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('preference-pattern', {
		url: '/preference-pattern',
		templateUrl: 'ogt/modules/preferencePattern/states/preferencePattern/preferencePattern.html',
		controller: 'PreferencePatternController',
		controllerAs: 'patternCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['PreferencePattern:execute']
	  }
	});
}]);

