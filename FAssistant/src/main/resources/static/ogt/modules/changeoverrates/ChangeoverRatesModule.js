'use strict';

angular.module('ChangeoverRatesModule', ['WebCoreModule']);
angular.module('ChangeoverRatesModule').config(['$stateProvider', function($stateProvider){
	
	$stateProvider.state('changeover-rates', {
		url: '/changeover-rates',
		templateUrl: 'ogt/modules/changeoverrates/states/changeoverRates/changeoverRates.html',
		controller: 'ChangeoverRatesController',
		controllerAs: 'changeoverRatesCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 modelsList: ['ChangeoverRatesService', function(ChangeoverRatesService) {
					return ChangeoverRatesService.getModels();
				}]
		},
		  data: {
			    policies: ['ProductAdministration:execute']
			  }

	});
	
	
}]);

