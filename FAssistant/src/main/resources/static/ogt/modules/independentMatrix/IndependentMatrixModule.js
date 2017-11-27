'use strict';

angular.module('IndependentMatrixModule', ['WebCoreModule','OgtModule']);

angular.module('IndependentMatrixModule').config(['$stateProvider', function($stateProvider) {
	$stateProvider.state('independent-matrix', {
		url: '/independent-matrix',
		templateUrl: 'ogt/modules/independentMatrix/states/independentMatrix.html',
		controller: 'IndependentMatrixController',
		controllerAs: 'independentMatrixCtrl',
		parent: 'ogt-ui-app',
		data: {
			policies: ['IndependentMatrix:execute']
	  }
	});
}]);