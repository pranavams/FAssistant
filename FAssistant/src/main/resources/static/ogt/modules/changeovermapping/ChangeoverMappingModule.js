'use strict';

angular.module('ChangeoverMappingModule', ['WebCoreModule']);
angular.module('ChangeoverMappingModule').config(['$stateProvider', function($stateProvider){
	
	$stateProvider.state('changeover-mapping-list', {
		url: '/changeover-mapping-list',
		templateUrl: 'ogt/modules/changeovermapping/states/changeovermapping/ChangeoverMapping.html',
		controller: 'ChangeoverMappingController',
		controllerAs: 'changeoverMappingCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketsList: ['ChangeoverMappingService','MarketGroupSelectModalService', function(ChangeoverMappingService,MarketGroupSelectModalService) {
					return ChangeoverMappingService.getMarketInformation(MarketGroupSelectModalService.selectedBusiness,MarketGroupSelectModalService.selectedMarketGroup);
				}]
		},
		params: {
			'selectedMarket':undefined,
			'selectedModel':undefined,
			'selectedModelYear':undefined,
			'markets':undefined,
			'models':undefined,
			'modelYears':undefined
		},
		  data: {
			    policies: ['ChangeOverMappings:execute']
			  }

	});
	
	$stateProvider.state('create-edit-changeover-mapping', {
		url: '/create-edit-changeover-mapping',
		templateUrl: 'ogt/modules/changeovermapping/states/changeovermapping/createEditChangeoverMapping/ChangeoverMappingCreateEdit.html',
		controller: 'ChangeoverMappingCreateEditController',
		controllerAs: 'changeoverMappingCreateEditCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketsList: ['ChangeoverMappingService','MarketGroupSelectModalService', function(ChangeoverMappingService,MarketGroupSelectModalService) {
					return ChangeoverMappingService.getMarketInformation(MarketGroupSelectModalService.selectedBusiness,MarketGroupSelectModalService.selectedMarketGroup);
				}]
		},
		  data: {
			    policies: ['ChangeOverMappings:execute']
			  }

	});
	
	
}]);

