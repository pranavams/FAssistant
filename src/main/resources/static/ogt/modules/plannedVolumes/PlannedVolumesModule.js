'use strict';

angular.module('PlannedVolumesModule', ['WebCoreModule','OgtModule']);

angular.module('PlannedVolumesModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('planned-volumes', {
		url: '/weekly-volumes',
		templateUrl: 'ogt/modules/plannedVolumes/states/plannedVolumes/plannedVolumes.html',
		controller: 'PlannedVolumesController',
		controllerAs: 'plannedVolCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['WeeklyVolume:execute']
	  }
	});
}]);

